import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SystemHealthStrip } from './components/layout/SystemHealthStrip';
import { OperationsPage } from './pages/OperationsPage';
import { CamerasPage } from './pages/CamerasPage';
import { VehicleHistoryPage } from './pages/VehicleHistoryPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditHealthPage } from './pages/AuditHealthPage';
import { EvidenceReviewModal } from './components/detections/EvidenceReviewModal';
import { AlertTriageModal } from './components/alerts/AlertTriageModal';

import { 
  Camera, 
  Detection, 
  AlertItem, 
  WatchlistItem, 
  AnalyticsKPIs, 
  SystemHealth, 
  User 
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('cameras'); // Default to cameras view matching reference UI
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data States
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('Sector 7');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Active Modals & Selected Entities
  const [inspectingDetection, setInspectingDetection] = useState<Detection | null>(null);
  const [triagingAlert, setTriagingAlert] = useState<AlertItem | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [
        meData,
        camsData,
        detsData,
        alertsData,
        wlData,
        kpisData,
        healthData
      ] = await Promise.all([
        api.getMe(),
        api.getCameras(selectedSector),
        api.getDetections({ limit: 40 }),
        api.getAlerts(),
        api.getWatchlist(),
        api.getKPIs(),
        api.getSystemHealth()
      ]);

      setCurrentUser(meData);
      setCameras(camsData);
      if (camsData.length > 0 && !selectedCamera) {
        setSelectedCamera(camsData[0]);
      }
      setDetections(detsData);
      setAlerts(alertsData);
      setWatchlists(wlData);
      setKpis(kpisData);
      setHealth(healthData);
    } catch (err) {
      console.error('Error connecting to backend:', err);
    }
  }, [selectedSector, selectedCamera]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Role Switcher for Evaluation
  const handleRoleSwitch = async (role: string) => {
    try {
      const updated = await api.switchRole(role);
      setCurrentUser(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateDetection = async (cameraId: string) => {
    try {
      const newDet = await api.simulateDetection(cameraId);
      setDetections(prev => [newDet, ...prev]);
      api.getKPIs().then(setKpis);
      api.getAlerts().then(setAlerts);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchPlate = (plate: string) => {
    setGlobalSearchQuery(plate);
    setCurrentTab('history');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#221526] flex">
      {/* Left Navigation Rail matching reference */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen pr-4">
        {/* Sticky Header Bar in Deep Plum */}
        <Header
          cameras={cameras}
          selectedCamera={selectedCamera}
          onSelectCamera={setSelectedCamera}
          selectedSector={selectedSector}
          onSelectSector={setSelectedSector}
          onSearchPlate={handleSearchPlate}
          alertCount={alerts.filter(a => a.status === 'NEW').length}
        />

        {/* View Switcher Container */}
        <main className="flex-1 pb-10">
          {currentTab === 'operations' && (
            <OperationsPage
              cameras={cameras}
              selectedCamera={selectedCamera}
              onSelectCamera={setSelectedCamera}
              detections={detections}
              alerts={alerts}
              kpis={kpis}
              onReviewDetection={setInspectingDetection}
              onTriageAlert={setTriagingAlert}
              onSearchPlate={handleSearchPlate}
              onSimulateDetection={handleSimulateDetection}
            />
          )}

          {currentTab === 'cameras' && (
            <CamerasPage
              cameras={cameras}
              selectedCamera={selectedCamera}
              onSelectCamera={setSelectedCamera}
              detections={detections}
              onReviewDetection={setInspectingDetection}
              onTrackJourney={handleSearchPlate}
            />
          )}

          {currentTab === 'history' && (
            <VehicleHistoryPage
              cameras={cameras}
              selectedCamera={selectedCamera}
              onSelectCamera={setSelectedCamera}
              searchQuery={globalSearchQuery}
              onSearchPlate={setGlobalSearchQuery}
              onReviewDetection={setInspectingDetection}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              watchlists={watchlists}
              onTriageAlert={setTriagingAlert}
              onRefreshAlerts={() => api.getAlerts().then(setAlerts)}
              onRefreshWatchlists={() => api.getWatchlist().then(setWatchlists)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage kpis={kpis} />
          )}

          {currentTab === 'audit' && (
            <AuditHealthPage health={health} />
          )}
        </main>

        {/* Persistent Bottom Data-Health Strip */}
        <SystemHealthStrip
          health={health}
          onNavigate={setCurrentTab}
        />
      </div>

      {/* Global Evidence Review Modal */}
      {inspectingDetection && (
        <EvidenceReviewModal
          detection={inspectingDetection}
          onClose={() => setInspectingDetection(null)}
          onCorrectionSuccess={() => {
            fetchData();
            if (inspectingDetection) {
              api.getDetectionById(inspectingDetection.id).then(setInspectingDetection);
            }
          }}
        />
      )}

      {/* Global Alert Triage Modal */}
      {triagingAlert && (
        <AlertTriageModal
          alert={triagingAlert}
          onClose={() => setTriagingAlert(null)}
          onActionSuccess={() => {
            setTriagingAlert(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default App;
