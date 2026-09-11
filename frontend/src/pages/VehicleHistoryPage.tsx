import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Compass, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Camera, VehicleJourney, Detection } from '../types';
import { TacticalMap } from '../components/gis/TacticalMap';
import { api } from '../services/api';

interface VehicleHistoryPageProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  searchQuery: string;
  onSearchPlate: (plate: string) => void;
  onReviewDetection: (det: Detection) => void;
}

export const VehicleHistoryPage: React.FC<VehicleHistoryPageProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  searchQuery,
  onSearchPlate,
}) => {
  const [inputPlate, setInputPlate] = useState(searchQuery || 'DL01AB1234');
  const [journey, setJourney] = useState<VehicleJourney | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchJourney = async (plate: string) => {
    if (!plate.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getVehicleHistory(plate.trim());
      setJourney(data);
    } catch (err: any) {
      setJourney(null);
      setErrorMsg(err.message || 'No camera observations recorded for this plate number.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      setInputPlate(searchQuery);
      fetchJourney(searchQuery);
    } else {
      fetchJourney('DL01AB1234');
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchPlate(inputPlate.trim());
    fetchJourney(inputPlate.trim());
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4.5rem-2rem)] select-none">
      {/* Search Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAF3] flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-sm font-black text-[#081A33] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#0B2545]" />
            Cross-Camera Vehicle History & Journey Sequence
          </h1>
          <p className="text-xs text-[#5B6E8C]">
            Chronological camera observations query with verified timestamps
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={inputPlate}
              onChange={(e) => setInputPlate(e.target.value.toUpperCase())}
              placeholder="Enter plate (e.g. DL01AB1234)..."
              className="w-72 bg-[#F6F8FB] border border-[#D2DEEC] rounded-xl px-4 py-2 text-xs font-mono font-bold text-[#0B2545] focus:outline-none focus:border-[#0B2545] uppercase"
            />
            <Search className="w-4 h-4 text-[#5B6E8C] absolute right-3 top-2.5" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#0B2545] text-white font-bold text-xs hover:bg-[#12335C] transition shadow"
          >
            {isLoading ? 'Querying...' : 'Trace Stops'}
          </button>
        </form>
      </div>

      {/* Main Content: Split GIS Map & Observation Sequence Table */}
      <div className="grid grid-cols-5 gap-6 h-[560px]">
        {/* Left 3 Cols: GIS Tactical Map */}
        <div className="col-span-3 h-full">
          <TacticalMap
            cameras={cameras}
            selectedCamera={selectedCamera}
            onSelectCamera={onSelectCamera}
            journey={journey}
          />
        </div>

        {/* Right 2 Cols: Chronological Stop Timeline */}
        <div className="col-span-2 bg-white border border-[#E3EAF3] rounded-2xl p-5 flex flex-col justify-between shadow-md overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="border-b border-[#E3EAF3] pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#5B6E8C] uppercase tracking-wider">
                  Observed Journey Sequence
                </span>
                <div className="font-mono text-sm font-black text-[#0B2545] mt-0.5">
                  PLATE: {journey?.plate || inputPlate}
                </div>
              </div>

              {journey && (
                <div className="flex items-center gap-2">
                  {journey.total_distance_km !== undefined && journey.total_distance_km > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-[#F6F8FB] text-[#0B2545] font-mono text-[11px] font-bold border border-[#D2DEEC]">
                      {journey.total_distance_km} km Total
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-[#E8EEF6] text-[#0B2545] font-mono text-xs font-bold border border-[#D2DEEC]">
                    {journey.total_observations} Camera Stops
                  </span>
                </div>
              )}
            </div>

            {errorMsg ? (
              <div className="p-4 rounded-xl bg-[#E86A67]/15 border border-[#E86A67]/30 text-[#E86A67] text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Query Status:</strong>
                  {errorMsg}
                </div>
              </div>
            ) : journey && journey.observation_stops.length > 0 ? (
              <div className="space-y-3">
                {journey.observation_stops.map((stop, sIdx) => (
                  <div key={stop.stop_number} className="relative">
                    {/* Hop connector badge if not first stop */}
                    {sIdx > 0 && (
                      <div className="flex items-center justify-center my-1">
                        <div className="px-2.5 py-0.5 rounded-md bg-[#F6F8FB] border border-[#E3EAF3] text-[10px] font-mono text-[#5B6E8C] flex items-center gap-2 shadow-xs">
                          <span>↓ {stop.distance_from_prev_km ?? 0} km</span>
                          {stop.duration_mins_from_prev !== undefined && stop.duration_mins_from_prev !== null && (
                            <span>• {stop.duration_mins_from_prev} min</span>
                          )}
                          {stop.estimated_speed_kmh !== undefined && stop.estimated_speed_kmh !== null && (
                            <span className="text-[#0B2545] font-bold">~{stop.estimated_speed_kmh} km/h</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className="p-3.5 rounded-xl bg-[#F6F8FB] border border-[#E3EAF3] space-y-2 text-xs hover:border-[#0B2545] transition shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#8FBCE6] text-[#0B2545] font-black flex items-center justify-center font-mono text-xs shadow-sm">
                            {stop.stop_number}
                          </span>
                          <span className="font-bold text-[#081A33] font-mono">
                            {stop.camera_id} — {stop.camera_designation}
                          </span>
                        </div>
                        <span className="text-[#5B6E8C] font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0B2545]" />
                          {new Date(stop.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[#334E73]">
                        <span className="text-[#5B6E8C] block text-[11px]">Location:</span>
                        <strong className="text-[#081A33]">{stop.location_address}</strong>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] border-t border-[#E3EAF3]">
                        <span className="font-mono text-[#0B2545] font-bold">
                          Conf: {(stop.confidence_score * 100).toFixed(1)}%
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded bg-white border border-[#E3EAF3] text-[#0B2545]">
                          {stop.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-[#5B6E8C] text-xs">
                Enter a license plate above to reconstruct observation sequence.
              </div>
            )}
          </div>

          {/* Bottom Disclaimers */}
          <div className="pt-3 border-t border-[#E3EAF3] text-[11px] text-[#5B6E8C] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0B2545] shrink-0" />
            <span>Observations ordered chronologically across registered city nodes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
