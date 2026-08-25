import React, { useState } from 'react';
import { Camera, Detection } from '../types';
import { LiveFeedViewer } from '../components/cameras/LiveFeedViewer';
import { NodeTelemetryPanel } from '../components/cameras/NodeTelemetryPanel';
import { api } from '../services/api';

interface CamerasPageProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  detections: Detection[];
  onReviewDetection: (det: Detection) => void;
  onTrackJourney: (plate: string) => void;
}

export const CamerasPage: React.FC<CamerasPageProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  detections,
  onReviewDetection,
  onTrackJourney
}) => {
  const [showOverlay, setShowOverlay] = useState(true);

  const handleExport = () => {
    window.open(api.getExportDetectionsUrl(), '_blank');
  };

  const handleTriggerOCR = () => {
    const camDetection = detections.find(d => d.camera_id === selectedCamera?.id) || detections[0];
    if (camDetection) {
      onReviewDetection(camDetection);
    }
  };

  const handleTracking = () => {
    const camDetection = detections.find(d => d.camera_id === selectedCamera?.id) || detections[0];
    if (camDetection) {
      onTrackJourney(camDetection.normalized_plate_text);
    }
  };

  const handleModulateData = () => {
    // Triggers synthetic detection modulation on the active node
    if (selectedCamera) {
      api.simulateDetection(selectedCamera.id).then(newDet => {
        onReviewDetection(newDet);
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem-2rem)] overflow-hidden bg-[#F8F5EE]">
      {/* Center Live CCTV Stream & Sub-feed Selector */}
      <LiveFeedViewer
        camera={selectedCamera}
        allCameras={cameras}
        onSelectCamera={onSelectCamera}
        recentDetections={detections}
        onReviewDetection={onReviewDetection}
        showOverlay={showOverlay}
      />

      {/* Right Node Telemetry Panel matching reference mockup */}
      <NodeTelemetryPanel
        camera={selectedCamera}
        onExport={handleExport}
        onToggleOverlay={() => setShowOverlay(!showOverlay)}
        showOverlay={showOverlay}
        onTriggerOCR={handleTriggerOCR}
        onTrackJourney={handleTracking}
        onModulateData={handleModulateData}
      />
    </div>
  );
};
