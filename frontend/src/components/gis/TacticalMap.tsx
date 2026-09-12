import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, VehicleJourney } from '../../types';
import { Icon } from '../Icons';

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
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const [inspectedLocation, setInspectedLocation] = useState<{
    lat: number;
    lng: number;
    nearestCam?: string;
    distanceMeters?: number;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6585, 77.2730],
        zoom: 15,
        minZoom: 12,
        maxZoom: 19,
        zoomControl: false,
        preferCanvas: true
      });

      // OpenStreetMap High-Resolution Colored Basemap (100% Free, No Watermark, No API Key)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 12,
        keepBuffer: 8,
        updateWhenIdle: false,
        updateWhenZooming: false
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);

      // Handle map click for instant coordinate inspection
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        let nearest: Camera | null = null;
        let minDist = Infinity;
        cameras.forEach((c) => {
          const d = Math.hypot(c.latitude - lat, c.longitude - lng) * 111000;
          if (d < minDist) {
            minDist = d;
            nearest = c;
          }
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setInspectedLocation({
          lat,
          lng,
          nearestCam: nearest ? `${(nearest as any).designation || (nearest as any).name} (${(nearest as any).id})` : undefined,
          distanceMeters: Math.round(minDist),
          time: timeStr
        });

        if (clickMarkerRef.current) {
          map.removeLayer(clickMarkerRef.current);
        }

        const clickIcon = L.divIcon({
          className: 'custom-click-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #E86A67; border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px rgba(232,106,103,0.8);"></div>
              <div style="width: 2px; height: 10px; background: #E86A67;"></div>
            </div>
          `,
          iconSize: [20, 24],
          iconAnchor: [10, 24]
        });

        const marker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif; min-width: 200px;">
            <div style="font-weight: 800; color: #0B2545; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
              <span>📍 Inspected Coordinate</span>
              <span style="font-size: 10px; color: #5B6E8C;">${timeStr}</span>
            </div>
            <div style="font-family: monospace; font-size: 11px; background: #F6F8FB; padding: 4px 6px; border-radius: 6px; border: 1px solid #E3EAF3; color: #0B2545; font-weight: bold; margin-bottom: 4px;">
              ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E
            </div>
            ${nearest ? `
              <div style="font-size: 11px; color: #334E73;">
                <span style="color: #5B6E8C;">Nearest Sensor:</span><br/>
                <strong>${(nearest as any).designation || (nearest as any).name}</strong> (~${Math.round(minDist)}m away)
              </div>
            ` : ''}
          </div>
        `).openPopup();
        clickMarkerRef.current = marker;
      });

      mapInstanceRef.current = map;
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      window.addEventListener('resize', () => {
        map.invalidateSize();
      });
    }
  }, [cameras]);

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
            background: ${isSelected ? '#0B2545' : '#FFFFFF'};
            border: 2px solid #0B2545;
            box-shadow: 0 2px 10px rgba(10,36,68,0.3);
            color: ${isSelected ? '#F4F7FB' : '#0B2545'};
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
          <div style="font-weight: bold; color: #0B2545; font-size: 12px; margin-bottom: 2px;">
            ${cam.id} — ${cam.designation}
          </div>
          <div style="color: #334E73; font-size: 11px;">
            Location: ${cam.location_address}<br/>
            Status: <strong style="color: #0B2545;">${cam.status.toUpperCase()}</strong> | Throughput: ${cam.throughput_mbps} Mbps
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
                background: #8FBCE6;
                border: 2px solid #0B2545;
                box-shadow: 0 2px 8px rgba(10, 36, 68, 0.4);
                color: #0B2545;
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
                background: #0B2545;
                color: #F4F7FB;
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
            <div style="color: #0B2545; font-weight: bold; font-size: 12px;">
              Stop #${stop.stop_number} — ${stop.camera_id}
            </div>
            <div style="color: #334E73; font-size: 11px; margin-top: 2px;">
              Observed Plate: <strong>${stop.raw_plate_text}</strong><br/>
              Confidence: ${(stop.confidence_score * 100).toFixed(1)}%<br/>
              Timestamp: ${new Date(stop.timestamp).toLocaleString()}
            </div>
          </div>
        `);

        routeLayerRef.current?.addLayer(stopMarker);
      });

      if (latlngs.length > 1) {
        const polyline = L.polyline(latlngs, {
          color: '#0B2545',
          weight: 3.5,
          dashArray: '6, 6',
          opacity: 0.9
        });
        routeLayerRef.current.addLayer(polyline);
      }

      // Add midpoint directional hop badges between consecutive stops
      if (journey.observation_stops.length > 1) {
        for (let i = 0; i < journey.observation_stops.length - 1; i++) {
          const s1 = journey.observation_stops[i];
          const s2 = journey.observation_stops[i + 1];
          const midLat = (s1.latitude + s2.latitude) / 2;
          const midLng = (s1.longitude + s2.longitude) / 2;

          const midIcon = L.divIcon({
            className: 'custom-hop-midpoint',
            html: `
              <div style="
                background: #0B2545;
                color: #F6F8FB;
                font-family: monospace;
                font-size: 9px;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 9999px;
                border: 1.5px solid #FFFFFF;
                box-shadow: 0 2px 6px rgba(10, 36, 68, 0.4);
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 3px;
                pointer-events: none;
              ">
                <span>Stop ${s1.stop_number} → ${s2.stop_number}</span>
                ${s2.distance_from_prev_km !== undefined && s2.distance_from_prev_km !== null ? `<span>(${s2.distance_from_prev_km}km)</span>` : ''}
              </div>
            `,
            iconSize: [90, 20],
            iconAnchor: [45, 10]
          });

          const midMarker = L.marker([midLat, midLng], { icon: midIcon, interactive: false });
          routeLayerRef.current.addLayer(midMarker);
        }
      }

      mapInstanceRef.current.invalidateSize();
      if (latlngs.length > 1) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
      } else if (latlngs.length === 1) {
        mapInstanceRef.current.flyTo(latlngs[0], 15);
      }
    }
  }, [journey]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E3EAF3] shadow-xl bg-white">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Epistemic Restraint Mandatory Disclaimer Banner */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#D2DEEC] text-xs text-[#081A33] flex items-center gap-2.5 shadow-md max-w-md">
        <Icon name="info" className="w-4 h-4 text-[#0B2545] shrink-0" />
        <span className="text-[11px] text-[#334E73] leading-snug">
          <strong className="text-[#0B2545]">Civic Observation Sequence:</strong> Numbered camera stops represent discrete observations, not continuous GPS tracking.
        </span>
      </div>

      {/* Map Compass Indicator */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#D2DEEC] text-xs font-mono font-bold text-[#0B2545] flex items-center gap-1.5 shadow-sm">
        <Icon name="compass" className="w-3.5 h-3.5 text-[#0B2545]" />
        <span>KRISHNA / GANDHI NAGAR GIS</span>
      </div>

      {/* Floating Active Inspected Coordinates HUD */}
      {inspectedLocation && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#0B2545]/95 text-white backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shadow-2xl flex items-center gap-3 font-mono text-xs max-w-md">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E86A67] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-[#F4F7FB] flex items-center gap-2">
              <span>{inspectedLocation.lat.toFixed(5)}° N, {inspectedLocation.lng.toFixed(5)}° E</span>
              <span className="text-[10px] text-[#C2CFDF]">({inspectedLocation.time})</span>
            </div>
            {inspectedLocation.nearestCam && (
              <div className="text-[10.5px] text-[#D9E4F2] truncate">
                Near: {inspectedLocation.nearestCam} (~{inspectedLocation.distanceMeters}m away)
              </div>
            )}
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`${inspectedLocation.lat.toFixed(5)}, ${inspectedLocation.lng.toFixed(5)}`);
            }}
            className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-[10px] text-[#F4F7FB] uppercase tracking-wider font-bold transition shrink-0"
            title="Copy Coordinates"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};
