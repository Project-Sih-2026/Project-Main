import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, VehicleJourney } from '../../types';
import { Info, Compass } from 'lucide-react';

interface TacticalMapProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  journey: VehicleJourney | null;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  journey
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [40.7135, -74.0060],
        zoom: 14,
        zoomControl: false
      });

      // Light/Ivory CartoDB Positron Basemap Tiles matching inspiration UI
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Camera Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    cameras.forEach((cam) => {
      const isSelected = selectedCamera?.id === cam.id;
      
      const customIcon = L.divIcon({
        className: 'custom-camera-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${isSelected ? '#28142E' : '#FFFFFF'};
            border: 2px solid #28142E;
            box-shadow: 0 2px 10px rgba(40,20,46,0.3);
            color: ${isSelected ? '#F8F5EE' : '#28142E'};
            font-family: monospace;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
          ">
            ${cam.id.replace('CAM-', '')}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon: customIcon });
      
      marker.on('click', () => {
        onSelectCamera(cam);
      });

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <div style="font-weight: bold; color: #28142E; font-size: 12px; margin-bottom: 2px;">
            ${cam.id} — ${cam.designation}
          </div>
          <div style="color: #56495A; font-size: 11px;">
            Location: ${cam.location_address}<br/>
            Status: <strong style="color: #28142E;">${cam.status.toUpperCase()}</strong> | Throughput: ${cam.throughput_mbps} Mbps
          </div>
        </div>
      `);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [cameras, selectedCamera, onSelectCamera]);

  // Update Journey Trajectory Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (journey && journey.observation_stops.length > 0) {
      const latlngs: L.LatLngExpression[] = [];

      journey.observation_stops.forEach((stop) => {
        const pt: L.LatLngExpression = [stop.latitude, stop.longitude];
        latlngs.push(pt);

        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: #F3B6CA;
                border: 2px solid #28142E;
                box-shadow: 0 2px 8px rgba(40, 20, 46, 0.4);
                color: #28142E;
                font-family: monospace;
                font-size: 12px;
                font-weight: 900;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                ${stop.stop_number}
              </div>
              <div style="
                background: #28142E;
                color: #F8F5EE;
                font-size: 9px;
                font-family: monospace;
                padding: 1px 4px;
                border-radius: 4px;
                margin-top: 2px;
                white-space: nowrap;
              ">
                ${new Date(stop.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          `,
          iconSize: [28, 48],
          iconAnchor: [14, 24]
        });

        const stopMarker = L.marker(pt, { icon: stopIcon });
        stopMarker.bindPopup(`
          <div style="padding: 4px;">
            <div style="color: #28142E; font-weight: bold; font-size: 12px;">
              Stop #${stop.stop_number} — ${stop.camera_id}
            </div>
            <div style="color: #56495A; font-size: 11px; margin-top: 2px;">
              Observed Plate: <strong>${stop.raw_plate_text}</strong><br/>
              Confidence: ${(stop.confidence_score * 100).toFixed(1)}%<br/>
              Timestamp: ${new Date(stop.timestamp).toLocaleString()}
            </div>
          </div>
        `);

        routeLayerRef.current?.addLayer(stopMarker);
      });

      const polyline = L.polyline(latlngs, {
        color: '#28142E',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.85
      });
      routeLayerRef.current.addLayer(polyline);

      if (latlngs.length > 1) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      }
    }
  }, [journey]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E8E0D2] shadow-xl bg-white">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Epistemic Restraint Mandatory Disclaimer Banner */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#DED3C4] text-xs text-[#221526] flex items-center gap-2.5 shadow-md max-w-md">
        <Info className="w-4 h-4 text-[#28142E] shrink-0" />
        <span className="text-[11px] text-[#56495A] leading-snug">
          <strong className="text-[#28142E]">Civic Observation Sequence:</strong> Numbered camera stops represent discrete observations, not continuous GPS tracking.
        </span>
      </div>

      {/* Map Compass Indicator */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#DED3C4] text-xs font-mono font-bold text-[#28142E] flex items-center gap-1.5 shadow-sm">
        <Compass className="w-3.5 h-3.5 text-[#28142E]" />
        <span>GIS CONTEXT</span>
      </div>
    </div>
  );
};
