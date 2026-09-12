import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/appContext';
import { Icon } from '../components/Icons';
import { Badge, Btn, Card, Empty, Input, Kicker, Select, cx } from '../components/ui';
import { VEHICLES, camById, type Vehicle, type VehicleStatus } from '../data/mock';
import { api, BACKEND_STATIC } from '../services/api';
import { getDetectionPortalUrl } from '../utils/navigation';
import type { Detection } from '../types';

const TYPES = ['All types', 'Ambulance', 'Sedan', 'SUV', 'Truck', 'Bus', 'Two-wheeler', 'Van', 'Car'];
const STATUSES = ['All statuses', 'clear', 'watchlist', 'flagged'];
const TIME_WINDOWS = ['All Day (24h)', 'Live ANPR (30m)', 'Past 2 Hours', 'Shift Window (8h)', 'Past 7 Days File'];
const QUICK = ['dl-01', 'truck', 'stolen', 'dhaula', 'mh12', 'wb02'];

const STATUS_BADGE = (s: VehicleStatus): 'critical' | 'medium' | 'good' =>
  s === 'flagged' ? 'critical' : s === 'watchlist' ? 'medium' : 'good';

export function VehicleSearchPage() {
  const app = useApp();
  const navKey = `${app.navSeq}:${app.target.vehicleId ?? ''}`;
  const [q, setQ] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[0]);

  // Real Database Detections from Backend / AI Detection Engine
  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [selectedDetId, setSelectedDetId] = useState<string | null>(null);

  // Load live detections from SQLite database
  useEffect(() => {
    loadLiveDetections();
    const interval = setInterval(loadLiveDetections, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadLiveDetections = async () => {
    try {
      const data = await api.getDetections({ limit: 200 });
      if (Array.isArray(data)) {
        setLiveDetections(data);
        if (data.length > 0 && !selectedDetId) {
          setSelectedDetId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not load live detections:', err);
    }
  };

  useEffect(() => {
    if (app.target.query !== undefined) {
      setQ(app.target.query);
    }
  }, [app.navSeq, app.target.query]);

  useEffect(() => {
    const t = app.target.vehicleId;
    if (t) {
      setQ('');
      setType(TYPES[0]);
      setStatus(STATUSES[0]);
      const foundInLive = liveDetections.find(
        (d) => d.normalized_plate_text.toLowerCase() === t.toLowerCase() || d.id === t
      );
      if (foundInLive) {
        setSelectedDetId(foundInLive.id);
      }
    }
  }, [navKey, liveDetections]);

  // Filtered live detections
  const filteredLive = useMemo(() => {
    return liveDetections.filter((d) => {
      const hay = `${d.normalized_plate_text} ${d.raw_plate_text} ${d.vehicle_type} ${d.camera_id} ${d.owner_name || ''}`.toLowerCase();
      const matchesQuery = q.trim() === '' || hay.includes(q.trim().toLowerCase());
      const matchesType = type === TYPES[0] || d.vehicle_type?.toLowerCase() === type.toLowerCase();
      const matchesStatus =
        status === STATUSES[0] ||
        (status === 'watchlist' && d.has_alert) ||
        (status === 'flagged' && d.has_alert) ||
        (status === 'clear' && !d.has_alert);
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [liveDetections, q, type, status]);

  const selLive = liveDetections.find((d) => d.id === selectedDetId) ?? filteredLive[0];

  const frameSiblings = useMemo(() => {
    if (!selLive?.evidence_image_uri) return [];
    return liveDetections.filter((d) => d.evidence_image_uri === selLive.evidence_image_uri);
  }, [selLive, liveDetections]);

  return (
    <div className="page-shell fade-up">
      {/* Top Banner connecting to AI Detection Portal */}
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm">
            <Icon name="camera" className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-ink">Edge CCTV Vehicle Detection & Ingestion Portal</span>
              <span className="rounded bg-blue-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.2">AI PIPELINE</span>
            </div>
            <p className="text-xs text-mauve mt-0.5">
              Upload new CCTV image frames, recognize number plates, and associate vehicle/owner names into the database.
            </p>
          </div>
        </div>

        <button
          onClick={() => app.nav({ page: 'upload' })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all shrink-0 cursor-pointer"
        >
          <span>Open Detection Portal</span>
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hero & Search Form */}
      <Card tone="strong" className="page-hero p-4 sm:p-5">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand/75" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search plate, vehicle type, camera, or owner name…" className="h-11 pl-10" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={type} onChange={setType} options={TYPES} ariaLabel="Vehicle type" className="w-[130px]" />
            <Select value={status} onChange={setStatus} options={STATUSES} ariaLabel="Vehicle status" className="w-[140px]" />
            <Select value={timeWindow} onChange={setTimeWindow} options={TIME_WINDOWS} ariaLabel="Investigation window" className="w-[165px]" />
            <Btn
              variant="ghost"
              className="text-cream/90 hover:bg-cream/10 hover:text-cream"
              onClick={() => { setQ(''); setType(TYPES[0]); setStatus(STATUSES[0]); setTimeWindow(TIME_WINDOWS[0]); }}
              disabled={q === '' && type === TYPES[0] && status === STATUSES[0] && timeWindow === TIME_WINDOWS[0]}
            >
              Clear
            </Btn>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-sand/20 pt-3">
          <Kicker className="text-sand">Try</Kicker>
          {QUICK.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="rounded-full border border-sand/20 px-3 py-1.5 text-[14px] font-bold text-sand transition hover:border-clay/50 hover:bg-cream/10 hover:text-cream active:scale-95"
            >
              {s}
            </button>
          ))}

          {/* Database Source Indicator */}
          <div className="ml-auto flex items-center gap-2 rounded-xl bg-black/25 px-3 py-1.5 text-xs text-sand">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Live AI Ingestions</span>
            <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white">{liveDetections.length} Records</span>
          </div>
        </div>
      </Card>

      {/* Main Content: Split Master-Detail */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr] mt-4">
        {/* Left Column: Results List */}
        <Card className="section-contrast flex flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Kicker>Live AI Detections</Kicker>
              <span className="text-[14px] font-semibold tabular-nums text-mauve/70">
                {filteredLive.length} matches
              </span>
            </div>

            <button
              onClick={loadLiveDetections}
              disabled={isLoadingLive}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-500/10 px-2.5 py-1 rounded-md"
            >
              <Icon name="refresh" className={`h-3 w-3 ${isLoadingLive ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="mt-3 flex max-h-[560px] flex-col gap-1.5 overflow-y-auto pr-1">
            {filteredLive.length > 0 ? (
              filteredLive.map((d) => {
                const active = selLive?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDetId(d.id)}
                    className={cx(
                      'group w-full rounded-xl border p-3 text-left transition-all duration-150 active:scale-[0.99] flex items-center gap-3',
                      active ? 'border-blue-600/50 bg-blue-500/10 shadow-sm' : 'border-clay/20 hover:border-blue-500/40 hover:bg-cream/80'
                    )}
                  >
                    {/* Evidence Image Thumbnail */}
                    <img
                      src={d.plate_crop_uri?.startsWith('http') ? d.plate_crop_uri : `${BACKEND_STATIC}${d.plate_crop_uri || d.evidence_image_uri}`}
                      alt="Crop"
                      className="h-10 w-16 object-contain rounded border border-clay/30 bg-black/90 p-0.5 shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-base font-black tracking-wide text-ink truncate">
                          {d.normalized_plate_text}
                        </span>
                        <Badge tone={d.has_alert ? 'critical' : 'good'}>
                          {d.has_alert ? 'Watchlist' : 'Stored'}
                        </Badge>
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 text-xs text-mauve/80 truncate">
                        {d.owner_name ? (
                          <span className="font-semibold text-ink truncate">{d.owner_name}</span>
                        ) : (
                          <span className="italic text-mauve/60">No name</span>
                        )}
                        <span>·</span>
                        <span className="font-medium text-blue-800">{d.vehicle_type}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-mauve">{d.camera_id}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-mauve space-y-3">
                <Icon name="camera" className="h-10 w-10 text-mauve/40 mx-auto" />
                <p className="font-semibold text-ink text-sm">No live detections match your filter</p>
                <p className="max-w-xs mx-auto text-mauve/70">
                  Upload images in the AI Detection Portal to see them instantly recorded in this database with their vehicle types and plates.
                </p>
                <button
                  onClick={() => app.nav({ page: 'upload' })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                >
                  <span>Upload Image in AI Portal</span>
                  <Icon name="arrowRight" className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Detail View with Images & Plate Metadata */}
        <div>
          {selLive ? (
            <div className="flex flex-col gap-4">
              <Card className="section-contrast p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-clay/20 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-3xl font-black tracking-wider text-ink">
                        {selLive.normalized_plate_text}
                          {selLive.normalized_plate_text}
                        </span>
                        <Badge tone={selLive.has_alert ? 'critical' : 'good'}>
                          {selLive.has_alert ? 'WATCHLIST HIT' : 'DATABASE STORED'}
                        </Badge>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-blue-800 bg-blue-500/10 px-2 py-0.5 rounded">
                          {selLive.vehicle_type}
                        </span>
                        {selLive.owner_name && (
                          <span className="font-semibold text-ink bg-sand/60 px-2 py-0.5 rounded">
                            Owner: {selLive.owner_name}
                          </span>
                        )}
                        <span className="text-mauve font-mono text-[11px]">
                          Raw: {selLive.raw_plate_text}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Btn
                        size="sm"
                        variant={selLive.has_alert ? 'solid' : 'soft'}
                        icon="shield"
                        onClick={() => app.toast(`Plate ${selLive.normalized_plate_text} monitored`)}
                      >
                        {selLive.has_alert ? 'On Watchlist' : 'Watchlist'}
                      </Btn>
                      <Btn
                        size="sm"
                        variant="soft"
                        icon="map"
                        onClick={() => app.nav({ page: 'map', mapVehicle: selLive.normalized_plate_text })}
                      >
                        GIS Map
                      </Btn>
                    </div>
                  </div>

                  {/* Multi-Vehicle Frame Siblings Selector */}
                  {frameSiblings.length > 1 && (
                    <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <Icon name="camera" className="h-4 w-4 text-blue-700" />
                          Same CCTV Frame Contains {frameSiblings.length} Vehicles:
                        </span>
                        <span className="text-[11px] text-blue-800 font-semibold bg-blue-200/60 px-2 py-0.5 rounded-full">
                          Select to inspect
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {frameSiblings.map((sib, sIdx) => {
                          const isCurrent = sib.id === selLive.id;
                          return (
                            <button
                              key={sib.id}
                              type="button"
                              onClick={() => setSelectedDetId(sib.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-blue-600 text-white shadow ring-2 ring-blue-400 scale-[1.02]'
                                  : 'bg-white text-ink border border-clay/30 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              <span className={`px-1.5 py-0.2 rounded text-[10px] ${isCurrent ? 'bg-blue-700 text-blue-100' : 'bg-sand text-mauve'}`}>
                                #{sIdx + 1}
                              </span>
                              <span>{sib.normalized_plate_text}</span>
                              <span className="text-[10px] uppercase font-sans font-medium opacity-80">
                                ({sib.vehicle_type})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* High-Resolution Evidence Frame & Cropped Plate Image Cards */}
                  <div>
                    <Kicker>CCTV Surveillance Evidence Images</Kicker>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="rounded-xl border border-clay/30 bg-cream/50 p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-mauve block mb-1">Cropped Plate Box</span>
                        {selLive.plate_crop_uri ? (
                          <img
                            src={selLive.plate_crop_uri.startsWith('http') ? selLive.plate_crop_uri : `${BACKEND_STATIC}${selLive.plate_crop_uri}`}
                            alt="Plate Crop"
                            className="w-full h-40 object-contain rounded-lg border border-clay/20 bg-black/90 p-2"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center font-mono text-sm font-bold text-ink bg-sand/30 rounded-lg">
                            {selLive.normalized_plate_text}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-clay/30 bg-cream/50 p-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-mauve block mb-1">Full Evidence Camera Frame</span>
                        <img
                          src={selLive.evidence_image_uri.startsWith('http') ? selLive.evidence_image_uri : `${BACKEND_STATIC}${selLive.evidence_image_uri}`}
                          alt="Full Evidence Frame"
                          className="w-full h-40 object-cover rounded-lg border border-clay/20 shadow-inner"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    </div>
                  </div>

                {/* Technical Detection Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-t border-clay/20 pt-3">
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">CAMERA INTERSECTION</span>
                    <span className="font-bold text-ink">{selLive.camera_id}</span>
                  </div>
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">TIMESTAMP</span>
                    <span className="font-mono text-ink text-[11px]">{new Date(selLive.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">OCR ACCURACY</span>
                    <span className="font-bold text-emerald-700">{(selLive.ocr_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">MODEL PIPELINE</span>
                    <span className="font-mono text-ink text-[11px]">{selLive.model_version || 'YOLOv8-ANPR'}</span>
                  </div>
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">PROCESSING STATUS</span>
                    <span className="font-bold text-ink">{selLive.processing_status}</span>
                  </div>
                  <div className="rounded-lg bg-cream/70 p-2 border border-clay/20">
                    <span className="text-mauve font-semibold block text-[10px]">INSPECTION SOURCE</span>
                    <span className="font-semibold text-blue-800">Live AI Feed</span>
                  </div>
                </div>

                {/* Multi-Camera Route Journey */}
                {(() => {
                  const matchingVeh = app.vehicles.find((v) => v.plate.replace(/[^A-Z0-9]/gi, '') === selLive.normalized_plate_text.replace(/[^A-Z0-9]/gi, ''));
                  if (!matchingVeh || matchingVeh.journey.length <= 1) return null;
                  return (
                    <div className="border-t border-clay/20 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-ink">Corridor Journey Tracking</span>
                        <span className="text-[11px] text-mauve font-mono">{matchingVeh.journey.length} Checkpoints Captured</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {matchingVeh.journey.map((j, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg bg-cream/50 px-2.5 py-1.5 text-xs border border-clay/20">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                              <span className="font-bold text-ink">{j.cam}</span>
                              <span className="text-mauve">{j.loc}</span>
                            </div>
                            <span className="font-mono text-mauve text-[11px]">{j.t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Quick Link to AI Detection Portal */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-ink block">Need to ingest another frame or edit this detection?</span>
                    <span className="text-mauve">Use the edge detection portal to upload and verify.</span>
                  </div>
                  <button
                    onClick={() => app.nav({ page: 'upload' })}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 shrink-0 cursor-pointer"
                  >
                    <span>Manage in AI Portal</span>
                    <Icon name="arrowRight" className="h-3 w-3" />
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            <Card><Empty title="Select a detection" sub="Click a recorded vehicle on the left to view evidence images and recognition details." /></Card>
          )}
        </div>
      </div>
    </div>
  );
}