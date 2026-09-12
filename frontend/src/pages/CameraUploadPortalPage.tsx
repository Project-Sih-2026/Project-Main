import { useEffect, useState, useRef, useMemo } from 'react';
import { useApp } from '../state/appContext';
import { api, BACKEND_STATIC } from '../services/api';
import type { Camera, Detection, WatchlistItem } from '../types';
import { Icon } from '../components/Icons';
import { getOperationsPortalUrl } from '../utils/navigation';

export function CameraUploadPortalPage() {
  const app = useApp();

  // State: Cameras
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-KN-01');
  const [cameraFilter, setCameraFilter] = useState<string>('ALL');
  const [cameraSearch, setCameraSearch] = useState<string>('');

  // State: Upload & Inference
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customPlateInput, setCustomPlateInput] = useState<string>('');
  const [ownerNameInput, setOwnerNameInput] = useState<string>('');
  const [customTimeInput, setCustomTimeInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDetection, setResultDetection] = useState<Detection | null>(null);
  const [resultEntries, setResultEntries] = useState<Array<{ detection: Detection }>>([]);
  const [selectedEntryIdx, setSelectedEntryIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State: Database Dataset & Inline Editing
  const [storedDetections, setStoredDetections] = useState<Detection[]>([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryTypeFilter, setRegistryTypeFilter] = useState('All');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOwnerName, setEditOwnerName] = useState<string>('');
  const [editCameraId, setEditCameraId] = useState<string>('');
  const [editTimestamp, setEditTimestamp] = useState<string>('');
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Helper for datetime-local string format YYYY-MM-DDTHH:mm
  const formatToLocalDateTimeInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setTimeToNow = () => {
    setCustomTimeInput(formatToLocalDateTimeInput(new Date()));
  };

  const adjustTimeMinutes = (minutesOffset: number) => {
    const base = customTimeInput ? new Date(customTimeInput) : new Date();
    const adjusted = new Date(base.getTime() + minutesOffset * 60000);
    setCustomTimeInput(formatToLocalDateTimeInput(adjusted));
  };

  // State: Watchlist
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [showWatchlistDrawer, setShowWatchlistDrawer] = useState(false);
  const [newWatchPlate, setNewWatchPlate] = useState('');
  const [newWatchCategory, setNewWatchCategory] = useState('STOLEN');
  const [newWatchSeverity, setNewWatchSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newWatchCase, setNewWatchCase] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCameras();
    loadStoredDetections();
    loadWatchlist();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await api.getCameras();
      if (Array.isArray(data) && data.length > 0) {
        setCameras(data);
        if (!selectedCamId) setSelectedCamId(data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load cameras:', err);
    }
  };

  const loadStoredDetections = async () => {
    setIsLoadingRegistry(true);
    try {
      const data = await api.getDetections({ limit: 150 });
      if (Array.isArray(data)) {
        setStoredDetections(data);
      }
    } catch (err) {
      console.warn('Failed to load stored detections:', err);
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  const loadWatchlist = async () => {
    try {
      const data = await api.getWatchlist();
      if (Array.isArray(data)) {
        setWatchlistItems(data);
      }
    } catch (err) {
      console.warn('Failed to load watchlist:', err);
    }
  };

  const selectedCam: Camera | null = cameras.find((c) => c.id === selectedCamId) || null;
  const currentCamId = selectedCam?.id || selectedCamId || 'CAM-KN-01';
  const currentCamDesignation = selectedCam?.designation || 'Lal Quarter Market Chowk';
  const currentCamAddress = selectedCam?.location_address || 'Lal Quarter Main Market, Krishna Nagar';
  const currentCamDistrict = selectedCam?.district || 'Krishna Nagar';
  const currentCamSector = selectedCam?.sector || 'East Delhi Core';

  // Switch camera & guarantee a fresh, reset upload state
  const handleSelectCamera = (camId: string, openFilePicker: boolean = false) => {
    setSelectedCamId(camId);
    setFile(null);
    setPreviewUrl(null);
    setResultDetection(null);
    setResultEntries([]);
    setSelectedEntryIdx(0);
    setErrorMsg(null);
    setCustomPlateInput('');
    setOwnerNameInput('');
    setCustomTimeInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    app.toast(`Camera ${camId} selected — fresh upload form ready.`);

    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (openFilePicker) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
    }
  };

  // Reset current camera upload state to clean
  const handleResetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
    setResultDetection(null);
    setResultEntries([]);
    setSelectedEntryIdx(0);
    setErrorMsg(null);
    setCustomPlateInput('');
    setOwnerNameInput('');
    setCustomTimeInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    app.toast('Upload form reset to fresh state.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setErrorMsg(null);
    }
  };

  const handleUploadAndRunAI = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setResultDetection(null);

    const plateToUse = customPlateInput.trim() || undefined;
    const ownerToUse = ownerNameInput.trim() || undefined;
    const timeToUse = customTimeInput ? customTimeInput : undefined;

    try {
      let fileToUpload = file;

      if (!fileToUpload) {
        setErrorMsg('Please select or drop an image before running detection.');
        setIsProcessing(false);
        return;
      }

      const res = await api.uploadFrameAndGetRoute(selectedCamId, fileToUpload, plateToUse, ownerToUse, timeToUse);
      const entries = res.detections && res.detections.length > 0 ? res.detections : [{ detection: res.detection }];
      setResultEntries(entries);
      setSelectedEntryIdx(0);
      setResultDetection(entries[0].detection);
      if (entries.length > 1) {
        app.toast(`Multi-vehicle frame: ${entries.length} plates detected! Select below to inspect.`);
      } else {
        app.toast(`Plate ${res.detection.normalized_plate_text} detected & stored in dataset!`);
      }
      // Refresh database dataset records immediately
      loadStoredDetections();
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Detection failed. Please check backend connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update Owner/Vehicle Name, Camera, and Timestamp in the dataset
  const handleStartEditRow = (detection: Detection) => {
    setEditingId(detection.id);
    setEditOwnerName(detection.owner_name || '');
    setEditCameraId(detection.camera_id || selectedCamId);
    try {
      const d = new Date(detection.timestamp);
      setEditTimestamp(formatToLocalDateTimeInput(d));
    } catch {
      setEditTimestamp('');
    }
  };

  const handleSaveUpdatedRow = async (detectionId: string) => {
    setIsSavingRecord(true);
    try {
      const payload: any = {
        owner_name: editOwnerName.trim(),
        camera_id: editCameraId || undefined,
      };
      if (editTimestamp) {
        payload.timestamp = editTimestamp;
      }
      await api.updateDetection(detectionId, payload);
      app.toast('Detection record & passage time updated in dataset!');
      setEditingId(null);
      loadStoredDetections();
    } catch (err: any) {
      app.toast(`Failed to update: ${err.message}`);
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleDeleteDetection = async (id: string, plate: string) => {
    if (!window.confirm(`Are you sure you want to delete record ${plate} (${id}) from database?`)) return;
    setIsDeleting(id);
    try {
      await api.deleteDetection(id);
      app.toast(`Record ${plate} deleted from database.`);
      if (resultDetection?.id === id) setResultDetection(null);
      loadStoredDetections();
    } catch (err: any) {
      app.toast(`Failed to delete: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePurgeAllDatabase = async () => {
    if (!window.confirm('Are you sure you want to delete ALL stored detections from the database? This cannot be undone.')) return;
    setIsLoadingRegistry(true);
    try {
      await api.purgeAllDetections();
      app.toast('Database cleared: All detection records purged.');
      setResultDetection(null);
      loadStoredDetections();
    } catch (err: any) {
      app.toast(`Purge failed: ${err.message}`);
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  const handleAddCurrentToWatchlist = async (plate: string) => {
    try {
      await api.addWatchlist({
        normalized_plate: plate,
        category: 'STOLEN',
        severity: 'HIGH',
        description: 'Flagged via Vehicle Detection Portal for automated alert tracking',
        case_number: `CASE-${Date.now().toString().slice(-4)}`,
        is_active: true
      });
      app.toast(`Plate ${plate} added to active watchlist!`);
      loadWatchlist();
      loadStoredDetections();
    } catch (err: any) {
      app.toast(`Failed to flag plate: ${err.message}`);
    }
  };

  const handleAddNewWatchlistPlate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchPlate.trim()) return;
    try {
      await api.addWatchlist({
        normalized_plate: newWatchPlate.trim().toUpperCase(),
        category: newWatchCategory,
        severity: newWatchSeverity,
        description: 'Manual target registration',
        case_number: newWatchCase || `CASE-${Date.now().toString().slice(-4)}`,
        is_active: true
      });
      app.toast(`Vehicle ${newWatchPlate.toUpperCase()} added to monitoring list`);
      setNewWatchPlate('');
      setNewWatchCase('');
      loadWatchlist();
    } catch (err: any) {
      app.toast(`Error: ${err.message}`);
    }
  };

  const handleDeactivateWatchlist = async (id: string, plate: string) => {
    try {
      await api.deactivateWatchlist(id);
      app.toast(`Plate ${plate} removed from active watchlist`);
      loadWatchlist();
    } catch (err: any) {
      app.toast(`Failed: ${err.message}`);
    }
  };

  // Distinct districts from all loaded cameras
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    cameras.forEach((c) => {
      if (c.district) set.add(c.district);
    });
    return ['ALL', ...Array.from(set)];
  }, [cameras]);

  // Filtered cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((c) => {
      const matchDistrict = cameraFilter === 'ALL' || c.district === cameraFilter;
      const matchSearch =
        !cameraSearch ||
        c.id.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        c.designation.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        c.location_address.toLowerCase().includes(cameraSearch.toLowerCase()) ||
        c.sector.toLowerCase().includes(cameraSearch.toLowerCase());
      return matchDistrict && matchSearch;
    });
  }, [cameras, cameraFilter, cameraSearch]);

  // Filtered detections in database dataset
  const filteredDetections = useMemo(() => {
    return storedDetections.filter((d) => {
      const matchesSearch =
        !registrySearch ||
        d.normalized_plate_text.toLowerCase().includes(registrySearch.toLowerCase()) ||
        d.raw_plate_text.toLowerCase().includes(registrySearch.toLowerCase()) ||
        d.camera_id.toLowerCase().includes(registrySearch.toLowerCase()) ||
        (d.owner_name && d.owner_name.toLowerCase().includes(registrySearch.toLowerCase()));
      const matchesType =
        registryTypeFilter === 'All' ||
        d.vehicle_type?.toLowerCase() === registryTypeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [storedDetections, registrySearch, registryTypeFilter]);

  const uniquePlatesCount = useMemo(() => {
    return new Set(storedDetections.map((d) => d.normalized_plate_text)).size;
  }, [storedDetections]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Top Header & Stat Indicators */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-clay/25 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Edge CCTV Ingestion • YOLOv8 Custom Weights: <span className="font-mono font-bold text-sky-300 bg-blue-900/60 border border-blue-400/30 px-1.5 py-0.5 rounded">best.pt</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl drop-shadow-sm">
            Vehicle Detection & Dataset Management
          </h1>
          <p className="mt-1 text-sm text-slate-200/90 max-w-2xl">
            Click any surveillance camera to open its fresh image upload portal, assign vehicle or owner names to be saved in the dataset, and manage records directly in the persistent database below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="rounded-xl border border-clay/30 bg-white/90 px-4 py-2.5 shadow-sm">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Stored in Dataset</span>
            <span className="font-mono text-lg font-extrabold text-slate-900">{storedDetections.length}</span>
          </div>
          <div className="rounded-xl border border-clay/30 bg-white/90 px-4 py-2.5 shadow-sm">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Unique Plates</span>
            <span className="font-mono text-lg font-extrabold text-blue-600">{uniquePlatesCount}</span>
          </div>
          <button
            onClick={() => setShowWatchlistDrawer(!showWatchlistDrawer)}
            className="flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-900/40 backdrop-blur px-4 py-2.5 shadow-sm hover:bg-rose-900/60 transition-all text-left"
          >
            <div>
              <span className="text-rose-200 block text-[10px] uppercase font-bold">Watchlist Target Plates</span>
              <span className="font-mono text-lg font-extrabold text-rose-100">{watchlistItems.length}</span>
            </div>
            <Icon name="shield" className="h-4 w-4 text-rose-300 ml-1" />
          </button>
        </div>
      </div>

      {/* Watchlist Quick Target Drawer (Collapsible) */}
      {showWatchlistDrawer && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="shield" className="h-5 w-5 text-rose-600" />
              <h3 className="font-display font-bold text-ink">Active Watchlist Plate Targets</h3>
            </div>
            <button
              onClick={() => setShowWatchlistDrawer(false)}
              className="text-mauve hover:text-ink text-xs font-bold px-2 py-1 rounded-md"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form onSubmit={handleAddNewWatchlistPlate} className="space-y-3 lg:col-span-5">
              <div>
                <label className="text-[11px] font-semibold uppercase text-mauve">Target License Plate</label>
                <input
                  type="text"
                  value={newWatchPlate}
                  onChange={(e) => setNewWatchPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12AB1234 or DL01AB1234"
                  required
                  className="mt-1 w-full rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-ink focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-mauve">Category</label>
                  <select
                    value={newWatchCategory}
                    onChange={(e) => setNewWatchCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-ink focus:outline-none"
                  >
                    <option value="STOLEN">Stolen Vehicle</option>
                    <option value="WARRANT">Warrant Advisory</option>
                    <option value="TRAFFIC_OFFENDER">Traffic Offender</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-mauve">Severity</label>
                  <select
                    value={newWatchSeverity}
                    onChange={(e) => setNewWatchSeverity(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-ink focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase text-mauve">Case / FIR Number</label>
                <input
                  type="text"
                  value={newWatchCase}
                  onChange={(e) => setNewWatchCase(e.target.value)}
                  placeholder="e.g. FIR-2026-DELHI-001"
                  className="mt-1 w-full rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs text-ink focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition-all"
              >
                <Icon name="shield" className="h-4 w-4" />
                Add Plate to Watchlist
              </button>
            </form>

            <div className="lg:col-span-7 overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded-xl border border-rose-200 overflow-hidden">
                <thead className="bg-rose-100/60 text-rose-900 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Plate</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Case</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {watchlistItems.length > 0 ? (
                    watchlistItems.map((w) => (
                      <tr key={w.id} className="hover:bg-rose-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-ink">{w.normalized_plate}</td>
                        <td className="py-2.5 px-3">{w.category}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-rose-500/15 text-rose-700 px-2 py-0.5 text-[10px] font-bold">
                            {w.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-mauve font-mono">{w.case_number || '—'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeactivateWatchlist(w.id, w.normalized_plate)}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-mauve text-xs">
                        No active targets on watchlist. Add suspect plates using the form on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: INTERACTIVE CCTV CAMERAS (CLICK TO OPEN FRESH UPLOAD) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm">
              <Icon name="camera" className="h-5 w-5 text-blue-400" />
              1. CCTV Camera Network (Click Any Camera for Fresh Upload)
            </h2>
            <p className="text-xs text-slate-200/90 mt-0.5">
              Clicking any camera resets the upload form with a clean slate for that specific CCTV location.
            </p>
          </div>

          {/* District Filter & Search */}
          <div className="flex items-center gap-2">
            <select
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="rounded-xl border border-clay/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-ink focus:border-blue-500 focus:outline-none shadow-xs"
            >
              <option value="ALL">All Camera Locations ({cameras.length})</option>
              {availableDistricts
                .filter((d) => d !== 'ALL')
                .map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} ({cameras.filter((c) => c.district === dist).length})
                  </option>
                ))}
            </select>

            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mauve" />
              <input
                type="text"
                value={cameraSearch}
                onChange={(e) => setCameraSearch(e.target.value)}
                placeholder="Search camera or location..."
                className="w-48 rounded-xl border border-clay/30 bg-white/90 pl-8 pr-3 py-1.5 text-xs text-ink focus:border-blue-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Camera Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredCameras.map((cam) => {
            const isSelected = cam.id === selectedCamId;
            return (
              <div
                key={cam.id}
                onClick={() => handleSelectCamera(cam.id, false)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-500/10 shadow-md ring-2 ring-blue-500/40'
                    : 'border-clay/25 bg-white/85 hover:border-blue-500/60 hover:bg-sand/30 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 right-0 rounded-bl-xl bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Active Target
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black text-blue-800 bg-blue-500/15 px-2 py-0.5 rounded-md">
                      {cam.id}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ONLINE</span>
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-bold text-ink group-hover:text-blue-700 transition-colors truncate">
                    {cam.designation}
                  </h3>
                  <p className="text-[11px] text-mauve line-clamp-1 mt-0.5">
                    {cam.location_address}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-clay/15 pt-2 text-[11px] text-mauve">
                    <span className="font-medium text-ink/80 truncate">{cam.sector}</span>
                    <span className="font-mono text-[10px] text-mauve/70 shrink-0">{cam.direction || 'Dual'}</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-2 border-t border-clay/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCamera(cam.id, true);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                        : 'bg-cream/70 text-ink border border-clay/30 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    <Icon name="upload" className="h-3.5 w-3.5" />
                    <span>Upload to {cam.id}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: ACTIVE CAMERA FRESH UPLOAD PORTAL & AI INFERENCE */}
      <section ref={uploadSectionRef} className="rounded-3xl border border-clay/25 bg-white/95 p-6 shadow-sm">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-clay/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Icon name="camera" className="h-4 w-4" />
              <span>Active Target Camera Portal</span>
            </div>
            <h2 className="font-display text-xl font-bold text-ink mt-0.5">
              {currentCamId} — {currentCamDesignation}
            </h2>
            <p className="text-xs text-mauve mt-0.5">
              Location: <strong className="text-ink">{currentCamAddress}</strong> • District: <strong>{currentCamDistrict}</strong> ({currentCamSector})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-clay/30 bg-cream/70 px-4 py-2.5 text-xs font-bold text-ink hover:bg-sand/40 transition-all shadow-sm"
            >
              <Icon name="upload" className="h-4 w-4 text-blue-600" />
              <span>Browse Image</span>
            </button>

            <button
              onClick={handleResetUpload}
              className="flex items-center gap-1.5 rounded-xl border border-clay/30 bg-white px-3 py-2.5 text-xs font-semibold text-mauve hover:text-ink hover:bg-sand/30 transition-all shadow-sm"
              title="Clear current form and start fresh upload"
            >
              <Icon name="refresh" className="h-4 w-4" />
              <span>Fresh Form</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Upload Dropzone & Controls (Left 5 Cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                previewUrl
                  ? 'border-blue-500/60 bg-blue-500/5'
                  : 'border-clay/40 bg-cream/30 hover:border-blue-500/60 hover:bg-sand/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="mx-auto max-h-56 rounded-xl object-contain shadow-md border border-clay/20"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink truncate max-w-xs">
                      {file?.name || 'CCTV frame ready'}
                    </span>
                    <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      Change
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                    <Icon name="upload" className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">
                      Drag & Drop Vehicle Image for <span className="text-blue-700">{currentCamId}</span>
                    </p>
                    <p className="text-xs text-mauve/80 mt-1 max-w-xs mx-auto">
                      Supports JPG, PNG, WEBP camera frames. Click to browse.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Passage Timestamp / Observation Time Input */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-ink flex items-center gap-1.5">
                  <Icon name="clock" className="h-3.5 w-3.5 text-blue-600" />
                  <span>Passage Time / Observation Timestamp</span>
                </label>
                {customTimeInput ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-full">
                    Custom Time Set
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.2 rounded-full">
                    Auto: Real-Time
                  </span>
                )}
              </div>
              <input
                type="datetime-local"
                value={customTimeInput}
                onChange={(e) => setCustomTimeInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-clay/30 bg-cream/40 px-3.5 py-2 text-xs font-mono font-medium text-ink focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-mauve font-semibold text-[10px] mr-0.5">Quick Presets:</span>
                <button
                  type="button"
                  onClick={setTimeToNow}
                  className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 transition-colors shadow-xs"
                  title="Set to Current Real-time"
                >
                  ⚡ Now
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimeMinutes(-5)}
                  className="px-2 py-0.5 rounded-lg bg-clay/20 text-ink font-semibold text-[10px] hover:bg-clay/30 transition-colors"
                  title="5 minutes ago"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimeMinutes(-15)}
                  className="px-2 py-0.5 rounded-lg bg-clay/20 text-ink font-semibold text-[10px] hover:bg-clay/30 transition-colors"
                  title="15 minutes ago"
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimeMinutes(-60)}
                  className="px-2 py-0.5 rounded-lg bg-clay/20 text-ink font-semibold text-[10px] hover:bg-clay/30 transition-colors"
                  title="1 hour ago"
                >
                  -1h
                </button>
                {customTimeInput && (
                  <button
                    type="button"
                    onClick={() => setCustomTimeInput('')}
                    className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-700 font-bold text-[10px] hover:bg-red-500/25 transition-colors ml-auto"
                    title="Reset to current real-time"
                  >
                    Clear (Auto-Now)
                  </button>
                )}
              </div>
              <p className="text-[10px] text-mauve mt-1">
                Records exact time the car crossed <strong>{currentCamId}</strong> for transit intervals & travel speed tracking.
              </p>
            </div>

            {/* Owner / Vehicle Name Input for Dataset Storage */}
            <div>
              <label className="text-[11px] font-bold uppercase text-ink flex items-center justify-between">
                <span>Vehicle / Owner Name (Stored in Dataset)</span>
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-500/10 px-1.5 py-0.2 rounded">Dataset Field</span>
              </label>
              <input
                type="text"
                value={ownerNameInput}
                onChange={(e) => setOwnerNameInput(e.target.value)}
                placeholder="e.g. Rajesh Kumar (White Swift) or Police Patrol Unit #4"
                className="mt-1 w-full rounded-xl border border-clay/30 bg-cream/40 px-3.5 py-2.5 text-xs text-ink focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-mauve mt-0.5">
                This name will be saved in the database dataset and can be updated anytime below.
              </p>
            </div>

            {/* Optional Manual Plate Override */}
            <div>
              <label className="text-[11px] font-semibold uppercase text-mauve">
                Manual Plate Override (Optional)
              </label>
              <input
                type="text"
                value={customPlateInput}
                onChange={(e) => setCustomPlateInput(e.target.value.toUpperCase())}
                placeholder="Leave blank for automatic YOLOv8 + OCR detection"
                className="mt-1 w-full rounded-xl border border-clay/30 bg-cream/40 px-3.5 py-2 text-xs font-mono text-ink focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleUploadAndRunAI}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Icon name="refresh" className="h-5 w-5 animate-spin" />
                  <span>Processing with YOLOv8 & Storing in Database...</span>
                </>
              ) : (
                <>
                  <Icon name="activity" className="h-5 w-5" />
                  <span>Run AI Detection & Save to Dataset</span>
                </>
              )}
            </button>
          </div>

          {/* AI Inference Result Card (Right 7 Cols) */}
          <div className="space-y-4 lg:col-span-7">
            {errorMsg && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 flex items-center gap-3">
                <Icon name="shield" className="h-5 w-5 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/5 p-12 text-center min-h-[320px]">
                <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
                <h3 className="text-base font-bold text-ink">YOLOv8 ANPR Inference Active</h3>
                <p className="text-xs text-mauve mt-1 max-w-md">
                  Analyzing vehicle geometry at {currentCamId}, locating license plate box, executing OCR with Indian syntax rectification...
                </p>
              </div>
            )}

            {!isProcessing && !resultDetection && !errorMsg && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-clay/30 bg-cream/30 p-12 text-center min-h-[320px]">
                <Icon name="camera" className="h-12 w-12 text-mauve/40 mb-3" />
                <h3 className="text-base font-bold text-ink">Fresh Upload Ready for {currentCamId}</h3>
                <p className="text-xs text-mauve max-w-sm mt-1">
                  Upload an image on the left, optionally enter an Owner/Vehicle Name, and click <strong>Run AI Detection</strong> to extract and store the plate in the dataset below.
                </p>
              </div>
            )}

            {!isProcessing && resultDetection && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm space-y-4">
                {resultEntries.length > 1 && (
                  <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Icon name="camera" className="h-4 w-4 text-blue-700" />
                        Multiple Vehicles Detected in this Frame ({resultEntries.length} Total):
                      </span>
                      <span className="text-[11px] text-blue-800 font-semibold bg-blue-200/60 px-2 py-0.5 rounded-full">
                        Showing #{selectedEntryIdx + 1} of {resultEntries.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resultEntries.map((entry, idx) => {
                        const isSel = idx === selectedEntryIdx;
                        return (
                          <button
                            key={entry.detection.id}
                            type="button"
                            onClick={() => {
                              setSelectedEntryIdx(idx);
                              setResultDetection(entry.detection);
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                              isSel
                                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-[1.02]'
                                : 'bg-white text-ink border border-clay/30 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSel ? 'bg-blue-700 text-blue-100' : 'bg-sand text-mauve'}`}>
                              #{idx + 1}
                            </span>
                            <span>{entry.detection.normalized_plate_text}</span>
                            <span className="text-[10px] uppercase font-sans font-medium opacity-80">
                              ({entry.detection.vehicle_type || 'Vehicle'})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      ✓ AI Inference Success • Stored in Dataset
                    </span>
                    <h2 className="font-mono text-3xl font-black tracking-wider text-ink mt-0.5">
                      {resultDetection.normalized_plate_text}
                    </h2>
                    {resultDetection.owner_name && (
                      <p className="text-xs font-semibold text-emerald-900 mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">Owner/Name:</span>
                        <span>{resultDetection.owner_name}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      resultDetection.has_alert
                        ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/40'
                    }`}>
                      {resultDetection.has_alert ? `ALERT: ${resultDetection.alert_type}` : 'CLEAN VEHICLE'}
                    </span>
                    <p className="text-[11px] text-mauve font-mono mt-1">ID: {resultDetection.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-clay/30 bg-white/70 p-2 text-center">
                    <span className="text-[10px] font-bold uppercase text-mauve block mb-1">Cropped Plate Box</span>
                    {resultDetection.plate_crop_uri ? (
                      <img
                        src={resultDetection.plate_crop_uri.startsWith('http') ? resultDetection.plate_crop_uri : `${BACKEND_STATIC}${resultDetection.plate_crop_uri}`}
                        alt="Plate Crop"
                        className="w-full h-36 object-contain rounded-lg border border-clay/20 bg-black/90 p-2"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center font-mono text-sm font-bold text-ink bg-sand/30 rounded-lg">
                        {resultDetection.normalized_plate_text}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-clay/30 bg-white/70 p-2 text-center">
                    <span className="text-[10px] font-bold uppercase text-mauve block mb-1">Annotated Evidence</span>
                    <img
                      src={resultDetection.evidence_image_uri.startsWith('http') ? resultDetection.evidence_image_uri : `${BACKEND_STATIC}${resultDetection.evidence_image_uri}`}
                      alt="Full Evidence Frame"
                      className="w-full h-36 object-cover rounded-lg border border-clay/20"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="rounded-xl bg-white/80 p-2.5 border border-clay/20">
                    <span className="text-[10px] font-bold uppercase text-mauve block">Camera Node</span>
                    <span className="font-mono text-xs font-bold text-blue-700">{resultDetection.camera_id}</span>
                  </div>
                  <div className="rounded-xl bg-blue-50/70 p-2.5 border border-blue-300/40">
                    <span className="text-[10px] font-bold uppercase text-blue-800 block flex items-center gap-1">
                      <Icon name="clock" className="h-3 w-3 text-blue-600" />
                      <span>Passage Time</span>
                    </span>
                    <span className="font-mono text-xs font-black text-ink">
                      {new Date(resultDetection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-mauve block mt-0.5 font-medium">
                      {new Date(resultDetection.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-clay/20">
                    <span className="text-[10px] font-bold uppercase text-mauve block">Vehicle Type</span>
                    <span className="text-xs font-bold text-ink">{resultDetection.vehicle_type}</span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-clay/20">
                    <span className="text-[10px] font-bold uppercase text-mauve block">OCR Confidence</span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {(resultDetection.ocr_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2.5 border border-clay/20">
                    <span className="text-[10px] font-bold uppercase text-mauve block">Raw OCR Text</span>
                    <span className="font-mono text-xs font-bold text-ink">{resultDetection.raw_plate_text}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddCurrentToWatchlist(resultDetection.normalized_plate_text)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon name="shield" className="h-3.5 w-3.5" />
                      <span>Flag on Active Watchlist</span>
                    </button>

                    <button
                      onClick={() => {
                        const plate = resultDetection.normalized_plate_text || resultDetection.raw_plate_text;
                        app.nav({ page: 'map', mapVehicle: plate });
                        window.open(getOperationsPortalUrl('map', plate), '_blank');
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon name="map" className="h-3.5 w-3.5" />
                      <span>🗺️ View on City Map</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetUpload}
                      className="flex items-center gap-1.5 text-xs font-bold text-ink hover:text-blue-700 bg-white border border-clay/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon name="upload" className="h-3.5 w-3.5 text-blue-600" />
                      <span>Upload Another Image</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDetection(resultDetection.id, resultDetection.normalized_plate_text)}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: LIVE DATASET OF STORED NUMBER PLATES & NAMES */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <Icon name="layers" className="h-4 w-4 text-blue-400" />
              <span>Persistent SQLite Dataset</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white mt-0.5 drop-shadow-sm">
              3. Stored Vehicle Plates & Names Dataset ({storedDetections.length} Records)
            </h2>
            <p className="text-xs text-slate-200/90 mt-0.5">
              Live records stored in the SQLite database (<code className="font-mono text-white bg-white/10 px-1 py-0.5 rounded">traffic_analytics.db</code>). You can edit vehicle names directly in the table below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStoredDetections}
              disabled={isLoadingRegistry}
              className="flex items-center gap-1.5 rounded-xl border border-clay/30 bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-sm hover:bg-sand/30 transition-colors"
            >
              <Icon name="refresh" className={`h-4 w-4 ${isLoadingRegistry ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh Dataset</span>
            </button>

            {storedDetections.length > 0 && (
              <button
                onClick={handlePurgeAllDatabase}
                disabled={isLoadingRegistry}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-500/20 transition-colors shadow-sm"
              >
                <Icon name="trash" className="h-4 w-4" />
                <span>Purge All</span>
              </button>
            )}
          </div>
        </div>

        {/* Database Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-clay/20 bg-white/90 p-4 shadow-sm">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve" />
            <input
              type="text"
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              placeholder="Search plates, owner names, camera IDs..."
              className="w-full rounded-xl border border-clay/30 bg-cream/40 pl-10 pr-4 py-2 text-xs font-medium text-ink focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={registryTypeFilter}
              onChange={(e) => setRegistryTypeFilter(e.target.value)}
              className="rounded-xl border border-clay/30 bg-cream/40 px-3 py-2 text-xs font-medium text-ink focus:border-blue-500 focus:outline-none w-full sm:w-auto"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Ambulance">Ambulances</option>
              <option value="Car">Cars</option>
              <option value="Sedan">Sedans</option>
              <option value="SUV">SUVs</option>
              <option value="Truck">Trucks</option>
              <option value="Motorcycle">Motorcycles</option>
              <option value="Bus">Buses</option>
            </select>
          </div>
        </div>

        {/* Stored Plates & Names Table */}
        <div className="overflow-hidden rounded-2xl border border-clay/20 bg-white/95 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-clay/20 bg-cream/60 text-mauve font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Evidence Crop</th>
                  <th className="py-3.5 px-4">Plate Number</th>
                  <th className="py-3.5 px-4">Vehicle / Owner Name</th>
                  <th className="py-3.5 px-4">Vehicle Type</th>
                  <th className="py-3.5 px-4">Camera Node</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay/15">
                {filteredDetections.length > 0 ? (
                  filteredDetections.map((d) => (
                    <tr key={d.id} className="hover:bg-sand/20 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={d.plate_crop_uri?.startsWith('http') ? d.plate_crop_uri : `${BACKEND_STATIC}${d.plate_crop_uri || d.evidence_image_uri}`}
                          alt="Crop"
                          className="h-10 w-24 object-contain rounded border border-clay/30 bg-black/90 p-1"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm font-black text-ink flex items-center gap-2">
                          <span className="rounded bg-sand/60 px-2 py-0.5 border border-clay/30">
                            {d.normalized_plate_text}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(d.normalized_plate_text);
                              app.toast(`Copied ${d.normalized_plate_text}`);
                            }}
                            className="text-mauve hover:text-ink text-[11px]"
                            title="Copy Plate Number"
                          >
                            📋
                          </button>
                        </div>
                        <span className="text-[10px] text-mauve font-mono">Raw: {d.raw_plate_text}</span>
                      </td>

                      {/* Editable Owner / Vehicle Name Column */}
                      <td className="py-3 px-4">
                        {editingId === d.id ? (
                          <input
                            type="text"
                            value={editOwnerName}
                            onChange={(e) => setEditOwnerName(e.target.value)}
                            placeholder="Enter vehicle / owner name..."
                            className="rounded-lg border border-blue-500 bg-white px-2.5 py-1 text-xs text-ink focus:outline-none w-36 font-medium shadow-xs"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            {d.owner_name ? (
                              <span className="font-bold text-ink">{d.owner_name}</span>
                            ) : (
                              <span className="text-mauve/50 italic text-[11px]">No name set</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-ink">
                        {d.vehicle_type === 'Ambulance' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 text-red-700 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                            Ambulance
                          </span>
                        ) : (
                          d.vehicle_type || 'Vehicle'
                        )}
                      </td>

                      {/* Camera Node Column (Editable when row is selected) */}
                      <td className="py-3 px-4">
                        {editingId === d.id ? (
                          <select
                            value={editCameraId}
                            onChange={(e) => setEditCameraId(e.target.value)}
                            className="rounded-lg border border-blue-500 bg-white px-2 py-1 text-xs font-mono font-bold text-ink focus:outline-none shadow-xs"
                          >
                            {cameras.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.id} ({c.district})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-mono font-bold text-blue-800 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {d.camera_id}
                          </span>
                        )}
                      </td>

                      {/* Passage Timestamp Column (Editable when row is selected) */}
                      <td className="py-3 px-4">
                        {editingId === d.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="datetime-local"
                              value={editTimestamp}
                              onChange={(e) => setEditTimestamp(e.target.value)}
                              className="rounded-lg border border-blue-500 bg-white px-2 py-1 text-xs font-mono text-ink focus:outline-none w-44 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setEditTimestamp(formatToLocalDateTimeInput(new Date()))}
                              className="px-1.5 py-1 rounded bg-blue-100 text-blue-800 text-[10px] font-bold hover:bg-blue-200 transition-colors"
                              title="Set to Current Time"
                            >
                              Now
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-ink flex items-center gap-1">
                              <Icon name="clock" className="h-3 w-3 text-blue-600 shrink-0" />
                              <span>{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </span>
                            <span className="text-[10px] text-mauve font-medium">
                              {new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-emerald-700">
                          {(d.ocr_confidence * 100).toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {d.has_alert ? (
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            d.alert_type === 'EMERGENCY_AMBULANCE'
                              ? 'bg-red-500/20 text-red-700 border-red-500/40 animate-pulse'
                              : 'bg-rose-500/15 text-rose-700 border-rose-500/30'
                          }`}>
                            {d.alert_type === 'EMERGENCY_AMBULANCE' ? '🚨 AMBULANCE PRIORITY' : (d.alert_type || 'WATCHLIST')}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold">
                            STORED
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {editingId === d.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveUpdatedRow(d.id)}
                              disabled={isSavingRecord}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1"
                              title="Save changes"
                            >
                              {isSavingRecord ? 'Saving...' : '✓ Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-clay/30 bg-cream px-2.5 py-1.5 text-xs font-bold text-mauve hover:text-ink transition-colors"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEditRow(d)}
                              className="rounded-lg border border-clay/30 bg-white px-2 py-1.5 text-[11px] font-bold text-mauve hover:text-blue-700 hover:border-blue-400 transition-colors"
                              title="Edit name, camera, or passage timestamp"
                            >
                              <Icon name="edit" className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const plate = d.normalized_plate_text || d.raw_plate_text;
                                app.nav({ page: 'map', mapVehicle: plate });
                                window.open(getOperationsPortalUrl('map', plate), '_blank');
                              }}
                              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-bold text-blue-800 hover:bg-blue-500/20 transition-colors"
                              title="View vehicle trajectory on GIS City Map"
                            >
                              Map
                            </button>
                            <button
                              onClick={() => handleDeleteDetection(d.id, d.normalized_plate_text)}
                              disabled={isDeleting === d.id}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-500/20 transition-colors"
                              title="Delete this record"
                            >
                              <Icon name="trash" className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-mauve text-xs">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sand/40 text-mauve">
                          <Icon name="layers" className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-ink text-sm">Dataset is currently empty</p>
                        <p className="text-xs text-mauve max-w-sm">
                          Select any camera above, upload an image, and provide a name to start building your dataset.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
