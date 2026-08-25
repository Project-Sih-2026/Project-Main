import React, { useState } from 'react';
import { 
  Maximize2, 
  EyeOff, 
  Eye, 
  RotateCcw, 
  Settings, 
  CheckCircle,
  Video,
  Radio
} from 'lucide-react';
import { Camera, Detection } from '../../types';
import { BACKEND_STATIC } from '../../services/api';

interface LiveFeedViewerProps {
  camera: Camera | null;
  allCameras: Camera[];
  onSelectCamera: (cam: Camera) => void;
  recentDetections: Detection[];
  onReviewDetection: (det: Detection) => void;
  showOverlay: boolean;
}

export const LiveFeedViewer: React.FC<LiveFeedViewerProps> = ({
  camera,
  allCameras,
  onSelectCamera,
  recentDetections,
  onReviewDetection,
  showOverlay
}) => {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [isFeedHidden, setIsFeedHidden] = useState(false);

  if (!camera) return null;

  const cameraDetection = recentDetections.find(d => d.camera_id === camera.id) || recentDetections[0];

  return (
    <div className="flex-1 flex flex-col p-6 pl-4 space-y-4 overflow-y-auto select-none">
      {/* Top Header matching reference mockup */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-[#221526] font-sans">
              {camera.id}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#F3B6CA] text-[#28142E] tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86A67]" />
              LIVE
              <Radio className="w-3 h-3 text-[#28142E] ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-[#786C7C] font-medium mt-1">
            {camera.location_address}
          </p>
        </div>

        {/* Action Buttons matching reference */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DED3C4] text-xs font-bold text-[#221526] hover:bg-[#F8F5EE] transition shadow-sm">
            <RotateCcw className="w-3.5 h-3.5 text-[#56495A]" />
            <span>Reset</span>
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#32193A] hover:bg-[#43234D] text-xs font-bold text-[#F8F5EE] transition shadow-md">
            <Settings className="w-3.5 h-3.5 text-[#F3B6CA]" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Sub Header: Tactical Gallery View & Multi Select Mode */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold text-[#221526] tracking-tight">
          Tactical Gallery View
        </h2>

        <div className="flex items-center gap-2.5 text-xs text-[#56495A]">
          <span className="font-semibold">Multi Select Mode</span>
          <button
            onClick={() => setMultiSelectMode(!multiSelectMode)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              multiSelectMode ? 'bg-[#32193A]' : 'bg-[#DCD3C4]'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${
                multiSelectMode ? 'left-4.5' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main CCTV Feed Viewport in Deep Plum */}
      <div className="relative w-full aspect-video max-h-[460px] bg-[#28142E] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
        {/* Top-Left Active Feed Badge */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-[#28142E]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#4F2B5B] text-xs text-[#F8F5EE]">
            <span className="font-bold font-mono text-[#F3B6CA]">{camera.id}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#F3B6CA] text-[#28142E] text-[10px] font-bold">
              ACTIVE FEED
            </span>
          </div>
        </div>

        {/* Center Live Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          {cameraDetection && !isFeedHidden ? (
            <div className="relative w-full h-full">
              <img
                src={`${BACKEND_STATIC}${cameraDetection.evidence_image_uri}`}
                alt="Live Camera Stream"
                className="w-full h-full object-cover"
              />

              {/* Real-time AI Overlays */}
              {showOverlay && (
                <div 
                  onClick={() => onReviewDetection(cameraDetection)}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#28142E]/95 border border-[#E8A8BF] px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md cursor-pointer hover:scale-105 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#3D1E47] px-2.5 py-1 rounded-lg border border-[#4F2B5B]">
                      <span className="text-[9px] text-[#A690AC] block font-semibold">PLATE OCR</span>
                      <span className="font-mono text-xs font-bold text-[#F3B6CA]">
                        {cameraDetection.raw_plate_text}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-xs font-bold text-[#F8F5EE] block">{cameraDetection.vehicle_type}</span>
                      <span className="text-[10px] text-[#56D6B0] font-mono">
                        {(cameraDetection.confidence_score * 100).toFixed(1)}% Confidence
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#3D1E47] flex items-center justify-center text-[#F3B6CA] shadow-xl">
                <Video className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8F5EE] tracking-wide">LIVE CCTV FEED</h3>
                <p className="text-xs text-[#A690AC] max-w-sm mt-1">
                  Real-time stream connected. Waiting for signal from central dispatcher.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner on Feed matching reference */}
        <div className="flex items-end justify-between z-10">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#A690AC] font-bold block">
              LOCATION
            </span>
            <span className="text-base font-black text-[#F8F5EE] tracking-tight">
              {camera.designation}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              aria-label="Fullscreen Viewport"
              className="p-2 rounded-lg bg-[#28142E]/80 hover:bg-[#3D1E47] text-[#F8F5EE] transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsFeedHidden(!isFeedHidden)}
              aria-label="Toggle Camera Feed Visibility"
              className="p-2 rounded-lg bg-[#28142E]/80 hover:bg-[#3D1E47] text-[#F8F5EE] transition"
            >
              {isFeedHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-feed Camera Selector Cards matching reference mockup */}
      <div className="grid grid-cols-4 gap-3.5 pt-1">
        {allCameras.slice(0, 4).map((cam) => {
          const isSelected = cam.id === camera.id;
          return (
            <div
              key={cam.id}
              onClick={() => onSelectCamera(cam)}
              className={`p-3.5 rounded-xl transition-all duration-150 cursor-pointer select-none bg-white border ${
                isSelected
                  ? 'border-[#28142E] shadow-md ring-1 ring-[#28142E]'
                  : 'border-[#E8E0D2] hover:border-[#32193A] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-[#221526]">
                  {cam.id}
                </span>
                {isSelected ? (
                  <CheckCircle className="w-4 h-4 text-[#28142E]" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      cam.status === 'nominal'
                        ? 'bg-[#E86A67]'
                        : cam.status === 'scanning'
                        ? 'bg-[#E86A67] animate-pulse'
                        : 'bg-[#F3B6CA]'
                    }`}
                  />
                )}
              </div>

              {/* Progress/status line */}
              <div className="w-full bg-[#EFE7DC] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${
                    isSelected
                      ? 'bg-[#28142E] w-full'
                      : cam.status === 'scanning'
                      ? 'bg-[#E86A67] w-2/3 animate-pulse'
                      : 'bg-[#F3B6CA] w-1/2'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#786C7C]">
                <span className="font-medium">{isSelected ? 'Primary Node' : cam.status === 'scanning' ? 'Scanning...' : 'Standby'}</span>
                <span className="font-mono">{cam.throughput_mbps} Mbps</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
