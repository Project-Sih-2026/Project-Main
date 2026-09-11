import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Detection } from '../../types';
import { api } from '../../services/api';

interface OCRCorrectionDialogProps {
  detection: Detection;
  onClose: () => void;
  onSuccess: () => void;
}

export const OCRCorrectionDialog: React.FC<OCRCorrectionDialogProps> = ({
  detection,
  onClose,
  onSuccess
}) => {
  const [correctedPlate, setCorrectedPlate] = useState(detection.corrected_plate_text || detection.normalized_plate_text);
  const [reason, setReason] = useState('MISREAD_CHARACTER');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctedPlate.trim()) {
      setErrorMsg('Please provide a corrected plate number.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.submitOCRCorrection(detection.id, {
        corrected_plate: correctedPlate.trim(),
        reason,
        notes: notes.trim() || undefined
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit correction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 select-none">
      <div className="bg-white border border-[#E3EAF3] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
          <h3 className="text-sm font-black text-[#081A33] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B2545]" />
            Human OCR Plate Correction
          </h3>
          <button onClick={onClose} className="text-[#5B6E8C] hover:text-[#081A33]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-[#E86A67]/15 border border-[#E86A67]/30 text-[#E86A67] flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">Original Raw OCR (Immutable):</label>
            <div className="font-mono bg-[#F6F8FB] border border-[#D2DEEC] p-2.5 rounded-xl text-[#081A33] text-sm font-black">
              {detection.raw_plate_text}
            </div>
          </div>

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">Corrected Plate Reading:</label>
            <input
              type="text"
              value={correctedPlate}
              onChange={(e) => setCorrectedPlate(e.target.value.toUpperCase())}
              placeholder="e.g. DL01AB1234"
              className="w-full font-mono bg-[#F6F8FB] border border-[#D2DEEC] focus:border-[#0B2545] rounded-xl p-2.5 text-sm text-[#0B2545] font-black focus:outline-none uppercase shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">
              Mandatory Correction Reason (PRD REQ-OCR-REV-02):
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl p-2.5 text-[#081A33] font-semibold focus:outline-none focus:border-[#0B2545] cursor-pointer"
            >
              <option value="MISREAD_CHARACTER">Misread Character (e.g. 0 vs O, 1 vs I)</option>
              <option value="PARTIAL_OBSCURATION">Partial Plate Obscuration / Dirt</option>
              <option value="GLARE_REFLECTION">Headlight Glare / Sun Reflection</option>
              <option value="PLATE_DAMAGE">Physical Plate Distortion / Damage</option>
              <option value="HEURISTIC_OVERRIDE">Heuristic / High-Angle Distortions</option>
              <option value="OTHER">Other Operational Discrepancy</option>
            </select>
          </div>

          <div>
            <label className="block text-[#5B6E8C] mb-1 font-bold">Reviewer Notes (Optional):</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context or explanation for audit record..."
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
              {isSubmitting ? 'Recording Audit...' : 'Submit Verified Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
