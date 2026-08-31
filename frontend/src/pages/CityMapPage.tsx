import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Kicker, cx } from '../components/ui';
import { CAMERAS, HOTSPOTS, ROADS, VEHICLES, camById, timeAgo, type Vehicle, type Camera } from '../data/mock';

const CONGESTION: Record<string, number> = { r1: 3, r2: 2, r3: 4, r4: 2, r5: 1, r6: 3, r7: 2, r8: 2, r9: 1, r10: 2, r11: 1, r12: 2 };

// Defined Sector Extents for Instant Sector Zoom
interface SectorPreset {
  id: string;
  name: string;
  district: string;
  center: [number, number];
  zoom: number;
  camCount: number;
  bounds?: [[number, number], [number, number]];
}

const SECTORS: SectorPreset[] = [
  {
    id: 'all',
    name: 'Whole Delhi NCR',
    district: 'National Capital Region',
    center: [28.590, 77.195],
    zoom: 12,
    camCount: 26,
    bounds: [[28.520, 77.060], [28.660, 77.320]]
  },
  {
    id: 'central-vista',
    name: 'Central Vista & India Gate',
    district: 'Central Vista',
    center: [28.6150, 77.2240],
    zoom: 14.5,
    camCount: 4,
  },
  {
    id: 'connaught',
    name: 'Connaught Core & Barakhamba',
    district: 'Connaught Core',
    center: [28.6310, 77.2220],
    zoom: 14.5,
    camCount: 4,
  },
  {
    id: 'south-ring',
    name: 'South Delhi & AIIMS Ring Road',
    district: 'South Extension',
    center: [28.5690, 77.2280],
    zoom: 14,
    camCount: 6,
  },
  {
    id: 'dhaula-kuan',
    name: 'Dhaula Kuan & Chanakyapuri',
    district: 'Dhaula Kuan',
    center: [28.5940, 77.1720],
    zoom: 14,
    camCount: 4,
  },
  {
    id: 'aerocity',
    name: 'Aerocity & IGI Airport T3',
    district: 'Aerocity Hub',
    center: [28.5560, 77.1050],
    zoom: 13.8,
    camCount: 3,
  },
  {
    id: 'dnd-east',
    name: 'DND Flyway & East Gateways',
    district: 'DND Gateway',
    center: [28.5860, 77.2800],
    zoom: 13.8,
    camCount: 3,
  },
];

// Timeline 30-Minute Blocks
interface TimeSlice {
  id: string;
  label: string;
  timeRange: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  vehCount: number;
}

const TIMELINE_SLICES: TimeSlice[] = [
  { id: 'all', label: 'All Day (24h)', timeRange: '00:00 – 23:59', startH: 0, startM: 0, endH: 24, endM: 0, vehCount: 14 },
  { id: 't1', label: '07:00 – 07:30', timeRange: '07:00 – 07:30', startH: 7, startM: 0, endH: 7, endM: 30, vehCount: 6 },
  { id: 't2', label: '07:30 – 08:00', timeRange: '07:30 – 08:00', startH: 7, startM: 30, endH: 8, endM: 0, vehCount: 9 },
  { id: 't3', label: '08:00 – 08:30 (Peak)', timeRange: '08:00 – 08:30', startH: 8, startM: 0, endH: 8, endM: 30, vehCount: 14 },
  { id: 't4', label: '08:30 – 09:00 (Peak)', timeRange: '08:30 – 09:00', startH: 8, startM: 30, endH: 9, endM: 0, vehCount: 12 },
  { id: 't5', label: '09:00 – 09:30', timeRange: '09:00 – 09:30', startH: 9, startM: 0, endH: 9, endM: 30, vehCount: 10 },
  { id: 'recent', label: 'Past 30 mins', timeRange: 'Live Feed', startH: 8, startM: 45, endH: 9, endM: 30, vehCount: 11 },
];

export function CityMapPage() {
  const app = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const camerasLayerRef = useRef<L.LayerGroup | null>(null);
  const alertsLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const journeyLayerRef = useRef<L.LayerGroup | null>(null);
  const altCorridorLayerRef = useRef<L.LayerGroup | null>(null);

  const [layers, setLayers] = useState({
    cameras: true,
    journey: true,
    altRoutes: true,
    alerts: true,
    congestion: true,
  });

  const [mapReady, setMapReady] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedTimeSlice, setSelectedTimeSlice] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<'all' | 'DL' | 'HR' | 'UP'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selCamId, setSelCamId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    app.target.mapVehicle || app.target.vehicleId || 'v1'
  );

  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [28.590, 77.195],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // High-performance OpenStreetMap Standard Tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 10,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    camerasLayerRef.current = L.layerGroup().addTo(map);
    alertsLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    altCorridorLayerRef.current = L.layerGroup().addTo(map);
    journeyLayerRef.current = L.layerGroup().addTo(map);

    // Fit initial full Delhi corridor view
    map.fitBounds([[28.520, 77.060], [28.660, 77.320]], { padding: [30, 30] });

    mapInstanceRef.current = map;
    setMapReady(true);

    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Handle Sector Switch
  const handleSelectSector = (secId: string) => {
    setSelectedSector(secId);
    const sec = SECTORS.find((s) => s.id === secId);
    if (!sec || !mapInstanceRef.current) return;

    if (sec.bounds) {
      mapInstanceRef.current.fitBounds(sec.bounds, { padding: [30, 30] });
    } else {
      mapInstanceRef.current.flyTo(sec.center, sec.zoom, { duration: 0.9 });
    }
  };

  // Filter vehicles by Sector, Time Slice, and State
  const filteredVehicles = useMemo(() => {
    const curSlice = TIMELINE_SLICES.find((s) => s.id === selectedTimeSlice) || TIMELINE_SLICES[0];
    const sec = SECTORS.find((s) => s.id === selectedSector);

    return VEHICLES.filter((v) => {
      // State Filter (DL, HR, UP)
      if (stateFilter !== 'all') {
        const prefix = v.plate.split('-')[0]?.toUpperCase();
        if (prefix !== stateFilter) return false;
      }

      // Sector Filter (if not 'all', check if any checkpoint matches that district/corridor)
      if (sec && sec.id !== 'all') {
        const matchesSector = v.journey.some((evt) => {
          const c = camById(evt.cam);
          return c && (c.district.toLowerCase() === sec.district.toLowerCase() || c.name.toLowerCase().includes(sec.name.toLowerCase().slice(0, 6)));
        });
        if (!matchesSector) return false;
      }

      // Time Filter
      if (curSlice.id === 'all') return true;
      if (curSlice.id === 'recent') return v.lastSeen.includes('min') || v.lastSeen.includes('just');

      const hasObs = v.journey.some((evt) => {
        const [h, m] = evt.t.split(':').map((x) => parseInt(x, 10));
        const totalMins = h * 60 + m;
        const startMins = curSlice.startH * 60 + curSlice.startM;
        const endMins = curSlice.endH * 60 + curSlice.endM;
        return totalMins >= startMins && totalMins <= endMins;
      });

      return hasObs;
    });
  }, [selectedSector, selectedTimeSlice, stateFilter]);

  // Selected camera details and 30-min detected vehicles
  const selCam: Camera | undefined = useMemo(() => {
    return selCamId ? camById(selCamId) : undefined;
  }, [selCamId]);

  const cam30MinDetections = useMemo(() => {
    if (!selCam) return [];
    const hits: { vehicle: Vehicle; eventTime: string; speed: number; dir: string; note?: string }[] = [];

    VEHICLES.forEach((v) => {
      v.journey.forEach((evt) => {
        if (evt.cam === selCam.code || evt.cam === selCam.id || evt.loc.toLowerCase().includes(selCam.name.toLowerCase().slice(0, 8))) {
          hits.push({
            vehicle: v,
            eventTime: evt.t,
            speed: evt.speed,
            dir: evt.dir,
            note: evt.note
          });
        }
      });
    });

    // If none in mock journey, generate contextual simulated vehicles for that camera
    if (hits.length === 0) {
      VEHICLES.slice(0, 4).forEach((v, idx) => {
        hits.push({
          vehicle: v,
          eventTime: `08:${40 + idx * 5}`,
          speed: selCam.avgSpeed + (idx % 2 === 0 ? 5 : -4),
          dir: selCam.heading.split(' ')[0] || 'Transit',
        });
      });
    }

    return hits;
  }, [selCam]);

  // Active vehicle for route trajectory
  const focusVeh: Vehicle | undefined = useMemo(
    () => VEHICLES.find((v) => v.id === selectedVehicleId) || filteredVehicles[0] || VEHICLES[0],
    [selectedVehicleId, filteredVehicles]
  );

  // Search vehicle by plate
  const handleSearchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!q) return;

    const hit = VEHICLES.find(
      (v) =>
        v.plate.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q) ||
        q.includes(v.plate.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    );

    if (hit) {
      setSelectedVehicleId(hit.id);
      setLayers((l) => ({ ...l, journey: true }));
      app.toast(`Tracing route for ${hit.plate} (${hit.make} ${hit.model})`);
    } else {
      app.toast(`No vehicle matches registration "${searchQuery}"`);
    }
  };

  // Render Camera Markers on Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !camerasLayerRef.current) return;
    camerasLayerRef.current.clearLayers();

    if (!layers.cameras) return;

    CAMERAS.forEach((cam) => {
      const isSelected = selCamId === cam.id || selCamId === cam.code;
      const isOnline = cam.status === 'online';
      const isDegraded = cam.status === 'degraded';

      const statusColor = isOnline ? '#2563EB' : isDegraded ? '#D97706' : '#DC2626';
      const bgColor = isSelected ? '#1E293B' : '#FFFFFF';
      const textColor = isSelected ? '#FFFFFF' : '#1E293B';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-camera',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background: ${bgColor};
            border: 2.5px solid ${statusColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            color: ${textColor};
            font-family: system-ui, sans-serif;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            position: relative;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            ${cam.code.replace('CAM-', '')}
            ${isOnline ? `<span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background: #10B981; border: 1.5px solid #FFFFFF;"></span>` : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelCamId(cam.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([cam.lat, cam.lng], Math.max(mapInstanceRef.current.getZoom(), 14), { duration: 0.6 });
        }
      });

      marker.bindTooltip(`<strong>${cam.code}</strong>: ${cam.name}`, { direction: 'top', offset: [0, -16] });

      camerasLayerRef.current?.addLayer(marker);
    });
  }, [mapReady, layers.cameras, selCamId]);

  // Render Clean Chronological AI Route + Probable Alternative Branches (No Criss-Cross Web)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !journeyLayerRef.current || !altCorridorLayerRef.current) return;
    journeyLayerRef.current.clearLayers();
    altCorridorLayerRef.current.clearLayers();

    if (!layers.journey || !focusVeh || !focusVeh.journey || focusVeh.journey.length === 0) return;

    // Build strict chronological sequence of camera coordinates
    const stopCoords: [number, number][] = [];
    const stopData: { stopNum: number; cam: Camera; time: string; speed: number; note?: string }[] = [];

    focusVeh.journey.forEach((evt, idx) => {
      const c = camById(evt.cam);
      if (c) {
        stopCoords.push([c.lat, c.lng]);
        stopData.push({
          stopNum: idx + 1,
          cam: c,
          time: evt.t,
          speed: evt.speed,
          note: evt.note
        });
      }
    });

    if (stopCoords.length > 0) {
      const routeColor = focusVeh.status === 'watchlist' ? '#D97706' : focusVeh.status === 'flagged' ? '#DC2626' : '#2563EB';

      // 1. Initial sequential fallback line
      let routeLine = L.polyline(stopCoords, {
        color: routeColor,
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      journeyLayerRef.current.addLayer(routeLine);

      // 2. Render AI Feasible Alternative Transit Corridors (Segment by segment, cleanly curved)
      if (layers.altRoutes && stopCoords.length >= 2) {
        for (let i = 0; i < stopCoords.length - 1; i++) {
          const ptA = stopCoords[i];
          const ptB = stopCoords[i + 1];

          // Compute a gentle realistic alternative branch between camera A and camera B
          const midLat = (ptA[0] + ptB[0]) / 2 + ((i % 2 === 0 ? 1 : -1) * 0.005);
          const midLng = (ptA[1] + ptB[1]) / 2 + ((i % 2 === 0 ? -1 : 1) * 0.007);

          const altCorridor = L.polyline([ptA, [midLat, midLng], ptB], {
            color: '#8B5CF6',
            weight: 3,
            opacity: 0.6,
            dashArray: '4, 6',
            lineCap: 'round'
          });

          altCorridor.bindTooltip(`AI Feasible Branch (${i === 0 ? '34%' : '27%'} likelihood): Stop ${i + 1} ➔ Stop ${i + 2}`, {
            sticky: true,
            direction: 'center'
          });

          altCorridorLayerRef.current.addLayer(altCorridor);
        }
      }

      // 3. Fetch True Road-to-Road AI Primary Snapped Path from OSRM
      if (stopCoords.length >= 2) {
        const coordsQuery = stopCoords.map(([lat, lng]) => `${lng},${lat}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson`;

        fetch(osrmUrl)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 'Ok' && data.routes && data.routes[0]?.geometry?.coordinates) {
              const roadCoordinates: [number, number][] = data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );

              if (journeyLayerRef.current) {
                journeyLayerRef.current.removeLayer(routeLine);

                // Ambient Route Glow
                const casingLine = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: 8,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round'
                });
                journeyLayerRef.current.addLayer(casingLine);

                // Solid Tactical Primary Road Line
                const roadPolyline = L.polyline(roadCoordinates, {
                  color: routeColor,
                  weight: 4.5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                });
                journeyLayerRef.current.addLayer(roadPolyline);

                // Fit view strictly to the car's traversed sector
                if (mapInstanceRef.current) {
                  const bounds = L.latLngBounds(roadCoordinates);
                  mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
                }
              }
            }
          })
          .catch((err) => {
            console.warn('Road snapping fallback active:', err);
            if (stopCoords.length > 1 && mapInstanceRef.current) {
              const bounds = L.latLngBounds(stopCoords);
              mapInstanceRef.current.fitBounds(bounds, { padding: [55, 55], maxZoom: 15 });
            }
          });
      }

      // 4. Draw Clean Sequential Stop Waypoint Badges (1 -> 2 -> 3 -> 4)
      stopData.forEach((stop) => {
        const isWatch = focusVeh.status !== 'clear';
        const stopMarkerIcon = L.divIcon({
          className: 'custom-journey-stop',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${isWatch ? '#DC2626' : '#1E293B'};
              border: 2px solid #FFFFFF;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              color: #FFFFFF;
              font-family: monospace;
              font-size: 12px;
              font-weight: 800;
            ">
              ${stop.stopNum}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const stopMarker = L.marker([stop.cam.lat, stop.cam.lng], { icon: stopMarkerIcon });
        stopMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 3px; min-width: 220px;">
            <div style="font-size: 10px; font-weight: 800; color: #D97706; text-transform: uppercase;">
              Stop #${stop.stopNum} · ${stop.time}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 2px;">
              ${focusVeh.plate} (${focusVeh.make} ${focusVeh.model})
            </div>
            <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
              ${stop.cam.code}: ${stop.cam.name}
            </div>
            <div style="font-size: 11px; color: #334155; margin-top: 4px; background: #F1F5F9; padding: 4px 6px; border-radius: 4px;">
              Recorded Speed: <strong>${stop.speed} km/h</strong>
            </div>
            ${focusVeh.flaggedReason ? `
              <div style="font-size: 10px; color: #DC2626; margin-top: 4px; font-weight: 700; border-top: 1px solid #E2E8F0; padding-top: 3px;">
                🚨 ${focusVeh.flaggedReason}
              </div>` : ''
            }
          </div>
        `);

        journeyLayerRef.current?.addLayer(stopMarker);
      });
    }
  }, [mapReady, layers.journey, layers.altRoutes, focusVeh]);

  // Render Hotspots Layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!layers.congestion) return;

    HOTSPOTS.forEach((h) => {
      const color = h.level === 3 ? '#DC2626' : h.level === 2 ? '#D97706' : '#CA8A04';
      const circle = L.circle([h.lat, h.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: 450 + h.level * 200
      });

      circle.bindTooltip(`<strong>${h.name}</strong><br/>${h.veh.toLocaleString()} veh/hr · ${h.note}`, {
        sticky: true,
        direction: 'top'
      });

      hotspotsLayerRef.current?.addLayer(circle);
    });
  }, [mapReady, layers.congestion]);

  // Render Active Alerts Layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !alertsLayerRef.current) return;
    alertsLayerRef.current.clearLayers();

    if (!layers.alerts) return;

    app.alerts.filter((a) => a.status === 'open').forEach((a) => {
      const c = camById(a.cameraId);
      if (!c) return;

      const alertIcon = L.divIcon({
        className: 'custom-alert-pin',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #DC2626;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(220,38,38,0.6);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
          ">
            !
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([c.lat + 0.0015, c.lng + 0.0015], { icon: alertIcon });
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <div style="color: #DC2626; font-weight: 700; font-size: 11px; text-transform: uppercase;">
            ${a.severity} Alert — ${a.type}
          </div>
          <div style="font-weight: 700; color: #1E293B; font-size: 12px; margin-top: 2px;">
            ${a.title}
          </div>
          <div style="color: #64748B; font-size: 11px; margin-top: 4px;">
            ${a.detail}
          </div>
        </div>
      `);

      alertsLayerRef.current?.addLayer(marker);
    });
  }, [mapReady, layers.alerts, app.alerts]);

  return (
    <div className="page-shell fade-up">
      {/* Top Page Hero Banner */}
      <div className="page-hero flex flex-wrap items-end justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <Kicker className="text-sand">Tactical GIS Intelligence</Kicker>
          <p className="mt-1 font-display text-[28px] font-bold leading-tight text-cream sm:text-[32px]">
            Live City Map <span className="italic text-sand">· Delhi NCR Surveillance Grid</span>
          </p>
        </div>

        {/* Action Buttons & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cx(
                'rounded-full border px-3 py-1.5 text-[12px] font-bold capitalize transition-all duration-150 active:scale-95',
                layers[k] ? 'border-sand/50 bg-sand/20 text-sand' : 'border-cream/15 text-sand/70 hover:border-cream/30 hover:bg-cream/10 hover:text-cream'
              )}
            >
              {layers[k] ? '● ' : '○ '}
              {k === 'journey' ? 'AI Road Route' : k === 'altRoutes' ? 'Feasible Branches' : k}
            </button>
          ))}
        </div>
      </div>

      {/* Control Console: Sector Area Zoom + Timeline Chart + Plate Search */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-clay/25 bg-cream/90 p-4 shadow-sm backdrop-blur">
        {/* Row 1: Sector / Area Focus Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-ink flex items-center gap-1">
              <Icon name="map" className="h-3.5 w-3.5 text-dusk" />
              Focus Area / Sector:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleSelectSector(sec.id)}
                className={cx(
                  'rounded-lg px-2.5 py-1 text-[12px] font-bold transition active:scale-95',
                  selectedSector === sec.id
                    ? 'bg-dusk text-cream shadow-sm'
                    : 'border border-clay/35 bg-cream text-ink hover:bg-sand/40'
                )}
              >
                {sec.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-ink">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
              className="rounded-lg border border-clay/35 bg-cream px-2 py-1 text-[12px] font-bold text-ink outline-none"
            >
              <option value="all">All States (DL, HR, UP)</option>
              <option value="DL">Delhi (DL)</option>
              <option value="HR">Haryana (HR)</option>
              <option value="UP">Noida (UP)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Timeline Traffic Volume Density Bar Chart */}
        <div className="flex flex-col gap-1.5 border-t border-clay/20 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-dusk flex items-center gap-1">
              <Icon name="clock" className="h-3.5 w-3.5" />
              Select Observation Timeline Window:
            </span>
            <span className="text-[11px] font-bold text-mauve">
              {filteredVehicles.length} vehicles observed in selected sector & timeline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {TIMELINE_SLICES.map((ts) => {
              const isSel = selectedTimeSlice === ts.id;
              return (
                <button
                  key={ts.id}
                  onClick={() => setSelectedTimeSlice(ts.id)}
                  className={cx(
                    'flex flex-col rounded-lg border p-2 text-left transition-all active:scale-95',
                    isSel
                      ? 'border-dusk bg-dusk text-cream shadow-md'
                      : 'border-clay/30 bg-cream text-ink hover:border-dusk/40 hover:bg-sand/30'
                  )}
                >
                  <span className={cx('text-[11px] font-bold', isSel ? 'text-cream' : 'text-ink')}>
                    {ts.label}
                  </span>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className={isSel ? 'text-sand' : 'text-mauve'}>{ts.timeRange}</span>
                    <span className={cx('font-bold', isSel ? 'text-cream' : 'text-dusk')}>
                      {ts.vehCount} veh
                    </span>
                  </div>
                  {/* Visual density bar */}
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-clay/20">
                    <div
                      className={cx('h-full rounded-full', isSel ? 'bg-sand' : 'bg-dusk')}
                      style={{ width: `${(ts.vehCount / 14) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Direct Registration Search & Detected Cars Carousel */}
        <div className="flex flex-col gap-3 border-t border-clay/20 pt-3">
          <form onSubmit={handleSearchVehicle} className="flex items-center gap-2">
            <div className="relative flex flex-1 items-center">
              <Icon name="search" className="absolute left-3 h-4 w-4 text-mauve/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type car number (e.g. DL-01-AB-4821, HR-38, UP-16, DL-03)..."
                className="h-9 w-full rounded-lg border border-clay/35 bg-cream pl-9 pr-3 text-[13px] font-bold text-ink outline-none transition focus:border-dusk"
              />
            </div>
            <Btn size="sm" variant="solid" type="submit" icon="search">
              Trace AI Route
            </Btn>
          </form>

          {/* Quick Select Cards for Detected Cars in Window */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filteredVehicles.map((v) => {
              const isSel = v.id === selectedVehicleId;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setLayers((l) => ({ ...l, journey: true }));
                  }}
                  className={cx(
                    'flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 text-left transition-all active:scale-95',
                    isSel
                      ? 'border-dusk bg-dusk text-cream shadow-md'
                      : 'border-clay/35 bg-cream hover:border-dusk/40 hover:bg-sand/30'
                  )}
                >
                  <div>
                    <div className={cx('font-display text-[13px] font-bold', isSel ? 'text-cream' : 'text-ink')}>
                      {v.plate}
                    </div>
                    <div className={cx('text-[11px] font-semibold', isSel ? 'text-sand' : 'text-mauve')}>
                      {v.make} {v.model} · {v.journey.length} Cameras
                    </div>
                  </div>
                  <Badge tone={v.status === 'flagged' ? 'critical' : v.status === 'watchlist' ? 'medium' : 'good'}>
                    {v.status}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Width Leaflet Tactical Map */}
      <div className="mt-4 w-full">
        <div
          className="relative w-full rounded-2xl border border-clay/40 bg-cream/90 p-2 shadow-md overflow-hidden"
          style={{ height: '666px', minHeight: '666px' }}
        >
          <div
            ref={mapContainerRef}
            className="w-full rounded-xl overflow-hidden shadow-inner"
            style={{ height: '650px', minHeight: '650px', width: '100%', position: 'relative', zIndex: 1 }}
          />

          {/* Map Legend Overlay */}
          <div className="pointer-events-none absolute left-5 top-5 z-[999] flex flex-col gap-1.5 rounded-lg border border-clay/20 bg-cream/90 px-3 py-2 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> Surveillance Node (26 Active)</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" /> AI Estimated Primary Path</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" /> Probable Alternative Branch</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" /> Priority Alert Incident</span>
          </div>

          {/* Dedicated Camera 30-Minute Detections Sheet on Map */}
          {selCam && (
            <div className="absolute bottom-5 left-5 right-5 z-[1000] flex flex-col gap-2 rounded-xl border border-clay/35 bg-cream/95 p-4 shadow-2xl backdrop-blur sm:right-auto sm:max-w-lg">
              <div className="flex items-center justify-between border-b border-clay/25 pb-2">
                <div>
                  <div className="text-[16px] font-bold text-ink flex items-center gap-2">
                    <Icon name="camera" className="h-4 w-4 text-dusk" />
                    {selCam.code}: {selCam.name}
                  </div>
                  <div className="text-[12px] font-semibold text-mauve">
                    {selCam.district} · Heading: {selCam.heading}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={selCam.status === 'online' ? 'good' : 'critical'}>{selCam.status}</Badge>
                  <button
                    aria-label="Close"
                    onClick={() => setSelCamId(null)}
                    className="rounded-full p-1 text-mauve hover:bg-clay/20 hover:text-ink transition"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Camera Telemetrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-ink">
                <div className="rounded-lg bg-sand/30 p-1.5">
                  <div className="text-mauve text-[10px]">Avg Speed</div>
                  <div className="font-bold text-[13px]">{selCam.avgSpeed} km/h</div>
                </div>
                <div className="rounded-lg bg-sand/30 p-1.5">
                  <div className="text-mauve text-[10px]">Today's Volume</div>
                  <div className="font-bold text-[13px]">{selCam.vehiclesToday.toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-sand/30 p-1.5">
                  <div className="text-mauve text-[10px]">30-Min Log</div>
                  <div className="font-bold text-[13px] text-dusk">{cam30MinDetections.length} Cars</div>
                </div>
              </div>

              {/* Cars Passed Through This Camera in Past 30 Minutes */}
              <div className="mt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-dusk mb-1.5">
                  Vehicles Passed Through {selCam.code} in Past 30 Mins:
                </div>
                <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {cam30MinDetections.map((det, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-clay/25 bg-cream px-2.5 py-1.5 text-[12px]"
                    >
                      <div>
                        <div className="font-bold text-ink">{det.vehicle.plate}</div>
                        <div className="text-[10px] text-mauve">
                          {det.eventTime} · {det.speed} km/h · {det.dir}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={det.vehicle.status === 'watchlist' ? 'medium' : det.vehicle.status === 'flagged' ? 'critical' : 'good'}>
                          {det.vehicle.status}
                        </Badge>
                        <button
                          onClick={() => {
                            setSelectedVehicleId(det.vehicle.id);
                            setLayers((l) => ({ ...l, journey: true }));
                            app.toast(`Tracing full AI route for ${det.vehicle.plate}`);
                          }}
                          className="rounded-md bg-dusk px-2 py-0.5 text-[11px] font-bold text-cream hover:bg-ink transition"
                        >
                          Trace Route
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-1 flex items-center gap-2 border-t border-clay/25 pt-2">
                <Btn
                  size="sm"
                  variant="solid"
                  className="flex-1"
                  icon="camera"
                  onClick={() => app.nav({ page: 'cameras', cameraId: selCam.id })}
                >
                  Open Live Camera Stream
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Dashboard Panels Placed Below Map */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Column 1: Active AI Route Trajectory Breakdown with Explicit Flagged Reason */}
        {focusVeh && (
          <Card className="border-clay/30 bg-sand/45 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Kicker>Active Vehicle Dossier</Kicker>
                <Badge tone={focusVeh.status === 'flagged' ? 'critical' : focusVeh.status === 'watchlist' ? 'medium' : 'good'}>
                  {focusVeh.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-1 font-display text-[24px] font-bold text-ink">{focusVeh.plate}</div>
              <div className="text-[13px] font-semibold text-mauve/80">
                {focusVeh.make} {focusVeh.model} · {focusVeh.color} ({focusVeh.type})
              </div>

              {/* Prominent Legal / Incident Reason for Flagged / Watchlist Status */}
              {focusVeh.flaggedReason && (
                <div
                  className={cx(
                    'mt-3 rounded-lg p-3 text-[12px] border transition',
                    focusVeh.status === 'flagged'
                      ? 'bg-red-500/10 border-red-500/30 text-red-900'
                      : focusVeh.status === 'watchlist'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
                  )}
                >
                  <div className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Icon name="alert-triangle" className="h-3.5 w-3.5" />
                    {focusVeh.status === 'flagged'
                      ? '🚨 Police Flagged Reason:'
                      : focusVeh.status === 'watchlist'
                      ? '⚠️ Watchlist Violation:'
                      : '✅ Verification Status:'}
                  </div>
                  <div className="font-semibold leading-snug">{focusVeh.flaggedReason}</div>
                </div>
              )}

              {/* Step-by-Step Road Journey Legs */}
              <div className="mt-3 flex flex-col gap-2 border-t border-clay/25 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-dusk">
                  Sequential Observation Path ({focusVeh.journey.length} Checkpoints):
                </span>

                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {focusVeh.journey.map((evt, idx) => {
                    const c = camById(evt.cam);
                    return (
                      <div key={idx} className="flex items-start gap-2.5 text-[12px]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dusk text-[10px] font-bold text-cream">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-bold text-ink">{c?.name || evt.loc}</div>
                          <div className="text-[11px] text-mauve/85">
                            {evt.t} · {evt.speed} km/h · {evt.dir}
                          </div>
                          {idx < focusVeh.journey.length - 1 && (
                            <div className="mt-1 rounded bg-cream/80 p-1 text-[10px] text-ink/90 border border-clay/20">
                              <span className="font-bold text-amber-700">➜ AI Primary Path:</span> Road Corridor to {focusVeh.journey[idx + 1].cam}
                              <br />
                              <span className="font-bold text-purple-700">⤹ Feasible Branch:</span> Parallel Radial Route
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Btn size="sm" variant="solid" className="mt-4 w-full" icon="car" onClick={() => app.nav({ page: 'vehicles', vehicleId: focusVeh.id })}>
              Open Full Vehicle Dossier
            </Btn>
          </Card>
        )}

        {/* Column 2: Operational Sector Directory (Quick Area Selector) */}
        <Card className="p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <Kicker>Operational Sectors Directory</Kicker>
              <Badge tone="neutral">{SECTORS.length} Sectors</Badge>
            </div>
            <p className="mt-1 text-[12px] text-mauve/80">Select any municipal sector to focus cameras and filter vehicles:</p>
            <div className="mt-3 flex flex-col gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSector(s.id)}
                  className={cx(
                    'flex items-center justify-between rounded-xl p-2.5 text-left text-[13px] font-semibold transition border',
                    selectedSector === s.id
                      ? 'border-dusk bg-dusk text-cream font-bold shadow-sm'
                      : 'border-clay/25 hover:border-dusk/40 hover:bg-sand/35 text-ink'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="map" className="h-4 w-4 shrink-0 opacity-80" />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <span className={cx('text-[11px] shrink-0 font-bold', selectedSector === s.id ? 'text-sand' : 'text-mauve')}>
                    {s.camCount} Cameras
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSelectSector('all')}
            className="mt-3 w-full rounded-lg border border-clay/35 bg-cream/70 py-2 text-[12px] font-bold text-ink hover:bg-sand/40 transition text-center"
          >
            Reset to Whole Delhi Grid
          </button>
        </Card>

        {/* Column 3: Corridor Congestion & Open Alerts */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <Kicker>Corridor Congestion</Kicker>
            <div className="mt-3 flex flex-col gap-2.5">
              {ROADS.slice(0, 4).map((rd) => {
                const lv = CONGESTION[rd.id] || 2;
                return (
                  <button key={rd.id} onClick={() => app.toast(`${rd.name} — ${['free', 'light', 'moderate', 'heavy'][lv - 1]} traffic`)} className="group text-left">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-ink/90 group-hover:text-ink">{rd.name}</span>
                      <span className="font-semibold capitalize text-mauve">{['free', 'light', 'moderate', 'heavy'][lv - 1]}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-clay/20">
                      <div className="h-full rounded-full bg-dusk transition-all duration-500" style={{ width: `${lv * 25}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Kicker>Open Alerts in View</Kicker>
              <Badge tone="critical">{app.alerts.filter((a) => a.status === 'open').length}</Badge>
            </div>
            <div className="mt-2 flex flex-col">
              {app.alerts.filter((a) => a.status === 'open').slice(0, 3).map((a) => (
                <button key={a.id} onClick={() => app.nav({ page: 'alerts', alertId: a.id, statusFilter: 'open' })} className="hit items-start">
                  <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', a.severity === 'critical' ? 'bg-ink' : 'bg-mauve')} />
                  <span className="flex-1 truncate text-[13px] font-semibold text-ink/90">{a.title}</span>
                  <span className="text-[12px] font-semibold text-mauve/70">{timeAgo(a.minsAgo)}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}