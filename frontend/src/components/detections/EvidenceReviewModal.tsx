import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Edit3, 
  History,
  Info
} from 'lucide-react';
import { Detection, OCRCorrection } from '../../types';
import { api, BACKEND_STATIC } from '../../services/api';
import { OCRCorrectionDialog } from './OCRCorrectionDialog';

interface EvidenceReviewModalProps {
  detection: Detection | null;
  onClose: () => void;
  onCorrectionSuccess: () => void;
}

export const EvidenceReviewModal: React.FC<EvidenceReviewModalProps> = ({
  detection,
  onClose,
  onCorrectionSuccess
}) => {
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [revisions, setRevisions] = useState<OCRCorrection[]>([]);
  const [activeTab, setActiveTab] = useState<'evidence' | 'revisions'>('evidence');

  useEffect(() => {
    if (detection?.id) {
      api.getOCRRevisions(detection.id).then(setRevisions).catch(() => setRevisions([]));
    }
  }, [detection]);

  if (!detection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-white border border-[#E3EAF3] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E3EAF3] flex items-center justify-between bg-[#F6F8FB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0B2545] flex items-center justify-center text-[#8FBCE6] shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#081A33] flex items-center gap-2">
                Detection Evidence Inspection
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#0B2545] border border-[#D2DEEC]">
                  {detection.id}
                </span>
              </h2>
              <p className="text-xs text-[#5B6E8C]">
                Camera: {detection.camera_id} • Event Time: {new Date(detection.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl p-1 border border-[#D2DEEC] text-xs shadow-sm">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  activeTab === 'evidence' ? 'bg-[#0B2545] text-white shadow' : 'text-[#334E73]'
                }`}
              >
                Evidence
              </button>
              <button
                onClick={() => setActiveTab('revisions')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  activeTab === 'revisions' ? 'bg-[#0B2545] text-white shadow' : 'text-[#334E73]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Revisions ({revisions.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#5B6E8C] hover:text-[#081A33] hover:bg-[#E8EEF6] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'evidence' ? (
            <>
              {/* Evidence Images Comparison */}
              <div className="grid grid-cols-3 gap-4">
                {/* Full Frame CCTV Image */}
                <div className="col-span-2 space-y-2">
                  <span className="text-xs font-black text-[#081A33] uppercase tracking-wider block">
                    Full CCTV Context Frame
                  </span>
                  <div className="relative rounded-2xl overflow-hidden border border-[#E3EAF3] bg-[#0B2545] aspect-video shadow-md">
                    <img
                      src={`${BACKEND_STATIC}${detection.evidence_image_uri}`}
                      alt="CCTV Frame"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0B2545]/80 backdrop-blur px-2.5 py-1 rounded-lg border border-[#1B4577] text-[10px] font-mono font-bold text-[#8FBCE6]">
                      NODE: {detection.camera_id}
                    </div>
                  </div>
                </div>

                {/* Cropped Plate & Vehicle Patches */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-black text-[#081A33] uppercase tracking-wider block mb-2">
                      Plate Crop Patch
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-[#D2DEEC] bg-[#F6F8FB] p-2 flex items-center justify-center min-h-[90px] shadow-sm">
                      {detection.plate_crop_uri ? (
                        <img
                          src={`${BACKEND_STATIC}${detection.plate_crop_uri}`}
                          alt="Plate Crop"
                          className="max-h-20 object-contain rounded"
                        />
                      ) : (
                        <span className="text-xs text-[#5B6E8C]">Patch unavailable</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F6F8FB] p-4 rounded-2xl border border-[#E3EAF3] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5B6E8C]">Classification:</span>
                      <span className="font-bold text-[#081A33]">{detection.vehicle_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6E8C]">Detection Conf:</span>
                      <span className="font-mono text-[#0B2545] font-black">{(detection.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6E8C]">Model Engine:</span>
                      <span className="font-mono text-[#334E73]">{detection.model_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5B6E8C]">Processing:</span>
                      <span className="font-bold text-[#0B2545]">{detection.processing_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plate Readings Dual-Storage Comparison */}
              <div className="bg-[#F6F8FB] p-5 rounded-2xl border border-[#E3EAF3] space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E3EAF3] pb-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#0B2545]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#081A33]">
                      Dual-Storage OCR Verification
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCorrectionDialog(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B2545] text-white hover:bg-[#12335C] text-xs font-bold transition shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#8FBCE6]" />
                    <span>Submit Human OCR Correction</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E3EAF3] shadow-sm">
                    <span className="text-[11px] text-[#5B6E8C] font-semibold block mb-1">Original Machine Raw OCR</span>
                    <span className="font-mono text-base font-black text-[#081A33] tracking-widest">
                      {detection.raw_plate_text}
                    </span>
                    <span className="text-[10px] text-[#5B6E8C] block mt-1">(Immutable record)</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E3EAF3] shadow-sm">
                    <span className="text-[11px] text-[#5B6E8C] font-semibold block mb-1">Standardized Normalized Plate</span>
                    <span className="font-mono text-base font-black text-[#0B2545] tracking-widest">
                      {detection.normalized_plate_text}
                    </span>
                    <span className="text-[10px] text-[#0B2545] font-bold block mt-1">{(detection.ocr_confidence * 100).toFixed(1)}% OCR Conf</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#E3EAF3] shadow-sm">
                    <span className="text-[11px] text-[#5B6E8C] font-semibold block mb-1">Active Verified Value</span>
                    <span className="font-mono text-base font-black text-[#E86A67] tracking-widest">
                      {detection.corrected_plate_text || detection.normalized_plate_text}
                    </span>
                    <span className="text-[10px] text-[#5B6E8C] block mt-1 font-semibold">
                      {detection.is_corrected ? 'Correction Applied' : 'Auto-Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Revisions Tab */
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#081A33]">
                Immutable Revision & Audit Trail
              </h3>
              {revisions.length === 0 ? (
                <div className="text-center py-10 bg-[#F6F8FB] rounded-2xl border border-[#E3EAF3] text-xs text-[#5B6E8C]">
                  No manual corrections recorded. Operating on initial model inference.
                </div>
              ) : (
                revisions.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#F6F8FB] border border-[#E3EAF3] space-y-2 text-xs shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B2545] font-mono">Revision #{rev.revision_number}</span>
                      <span className="text-[#5B6E8C]">{new Date(rev.created_at).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#334E73]">
                      <div>
                        Original: <strong className="font-mono text-[#081A33]">{rev.original_ocr}</strong>
                      </div>
                      <div>
                        Corrected To: <strong className="font-mono text-[#0B2545]">{rev.corrected_plate}</strong>
                      </div>
                    </div>
                    <div className="text-[#334E73]">
                      Reason: <span className="text-[#0B2545] font-bold">{rev.reason}</span> • Reviewer: <span className="text-[#081A33] font-semibold">{rev.reviewer_username} ({rev.reviewer_id})</span>
                    </div>
                    {rev.notes && <p className="text-[#5B6E8C] italic bg-white p-2.5 rounded-xl border border-[#E3EAF3]">Notes: {rev.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#E3EAF3] bg-[#F6F8FB] flex justify-between items-center text-xs text-[#5B6E8C]">
          <span>Epistemic Guard: Machine readings require operator verification for critical alerts.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0B2545] text-white font-bold transition shadow-sm hover:bg-[#12335C]"
          >
            Close
          </button>
        </div>
      </div>

      {/* OCR Correction Dialog */}
      {showCorrectionDialog && (
        <OCRCorrectionDialog
          detection={detection}
          onClose={() => setShowCorrectionDialog(false)}
          onSuccess={() => {
            setShowCorrectionDialog(false);
            onCorrectionSuccess();
          }}
        />
      )}
    </div>
  );
};
