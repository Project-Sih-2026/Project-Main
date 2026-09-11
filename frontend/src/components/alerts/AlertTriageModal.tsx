import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { AlertItem } from '../../types';
import { api } from '../../services/api';

interface AlertTriageModalProps {
  alert: AlertItem | null;
  onClose: () => void;
  onActionSuccess: () => void;
}

export const AlertTriageModal: React.FC<AlertTriageModalProps> = ({
  alert,
  onClose,
  onActionSuccess
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('ACKNOWLEDGE');
  const [dismissalReason, setDismissalReason] = useState<string>('FALSE_POSITIVE_OCR');
  const [notes, setNotes] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!alert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.performAlertAction(alert.id, {
        action: selectedAction,
        assigned_to: assignedTo.trim() || undefined,
        reason: selectedAction === 'DISMISS' ? dismissalReason : undefined,
        notes: notes.trim() || undefined
      });
      onActionSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-white border border-[#E3EAF3] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E86A67]/20 flex items-center justify-center text-[#E86A67]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#081A33] flex items-center gap-2">
                Operational Alert Triage
                <span className="font-mono text-xs text-[#E86A67] font-bold">[{alert.status}]</span>
              </h3>
              <p className="text-[11px] text-[#5B6E8C]">Alert ID: {alert.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5B6E8C] hover:text-[#081A33]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Metadata Card */}
        <div className="bg-[#F6F8FB] p-4 rounded-2xl border border-[#E3EAF3] space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#5B6E8C]">Matched Plate:</span>
            <span className="font-mono font-black text-sm text-[#0B2545] bg-white px-2.5 py-0.5 rounded border border-[#D2DEEC]">
              {alert.plate_matched}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#5B6E8C]">Advisory Category:</span>
            <span className="font-bold text-[#081A33]">{alert.category.replace(/_/g, ' ')}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#5B6E8C]">Severity:</span>
            <span className={`font-black ${alert.severity === 'CRITICAL' ? 'text-[#E86A67]' : 'text-[#0B2545]'}`}>
              {alert.severity}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#5B6E8C]">Camera Observation Node:</span>
            <span className="font-mono font-bold text-[#081A33]">{alert.camera_id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#5B6E8C]">Timestamp:</span>
            <span className="text-[#334E73]">{new Date(alert.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Selection Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-[#E86A67]/15 border border-[#E86A67]/30 text-[#E86A67] flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">Triage Action:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] font-bold focus:outline-none focus:border-[#0B2545] cursor-pointer"
            >
              <option value="ACKNOWLEDGE">Acknowledge Alert (Move to In-Review)</option>
              <option value="ASSIGN">Assign to Field Dispatcher</option>
              <option value="ESCALATE">Escalate Severity to Critical</option>
              <option value="RESOLVE">Mark Resolved (Action Complete)</option>
              <option value="DISMISS">Dismiss Alert (Requires Mandatory Reason)</option>
              <option value="ANNOTATE">Add Operational Annotation Only</option>
            </select>
          </div>

          {selectedAction === 'ASSIGN' && (
            <div>
              <label className="block text-[#5B6E8C] mb-1 font-bold">Assign To Operator / Unit:</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Unit 4 / Dispatcher Marcus"
                className="w-full bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] focus:outline-none focus:border-[#0B2545] font-semibold"
              />
            </div>
          )}

          {selectedAction === 'DISMISS' && (
            <div>
              <label className="block text-[#E86A67] mb-1 font-black">
                Mandatory Dismissal Reason (PRD REQ-ALERT-04):
              </label>
              <select
                value={dismissalReason}
                onChange={(e) => setDismissalReason(e.target.value)}
                className="w-full bg-[#F6F8FB] border border-[#E86A67] rounded-xl p-2.5 text-[#081A33] font-bold focus:outline-none cursor-pointer"
                required
              >
                <option value="FALSE_POSITIVE_OCR">False Positive OCR Reading</option>
                <option value="UNMATCHED_CHARACTER">Character Mismatch Upon Human Review</option>
                <option value="OUTDATED_ALERT">Outdated / Expired Watchlist Notice</option>
                <option value="DUPLICATE_ENTRY">Duplicate Continuous Entry</option>
                <option value="AUTHORIZED_EXCEPTION">Authorized Emergency Exception</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">Operational Notes / Reason:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter dispatcher notes or justification..."
              className="w-full bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] focus:outline-none focus:border-[#0B2545] h-20 resize-none font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F6F8FB] text-[#334E73] hover:bg-[#E8EEF6] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#0B2545] text-white font-black hover:bg-[#12335C] transition disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? 'Processing...' : 'Execute Triage Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
