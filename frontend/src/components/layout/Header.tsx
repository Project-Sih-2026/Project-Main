import React, { useState } from 'react';
import { 
  Compass, 
  Radio, 
  Bell, 
  Settings as SettingsIcon, 
  ChevronDown,
  Search,
  RefreshCw
} from 'lucide-react';
import { Camera } from '../../types';
import { api } from '../../services/api';

interface HeaderProps {
  cameras: Camera[];
  selectedCamera: Camera | null;
  onSelectCamera: (cam: Camera) => void;
  selectedSector: string;
  onSelectSector: (sector: string) => void;
  onSearchPlate: (plate: string) => void;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cameras,
  selectedCamera,
  onSelectCamera,
  selectedSector,
  onSelectSector,
  onSearchPlate,
  alertCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchPlate(searchQuery.trim());
    }
  };

  const handleScanNetwork = async () => {
    setIsScanning(true);
    try {
      const res = await api.scanNetwork();
      setScanMessage(`Scan complete: ${res.scanned_nodes} nodes nominal`);
      setTimeout(() => setScanMessage(null), 3000);
    } catch (e) {
      setScanMessage('Network scan error');
      setTimeout(() => setScanMessage(null), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <header className="p-4 pl-0 select-none">
      {/* Deep Plum Rounded Top Nav Container matching reference */}
      <div className="h-14 bg-[#28142E] rounded-xl px-5 flex items-center justify-between shadow-lg">
        {/* Left Selectors */}
        <div className="flex items-center gap-2.5">
          {/* District */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3D1F44] text-xs font-semibold text-[#F8F5EE] border border-[#4F2B57] cursor-pointer">
              <span>Central District</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D8C8DC]" />
            </div>
          </div>

          <span className="text-[#88708C] text-xs">•</span>

          {/* Sector */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => onSelectSector(e.target.value)}
              aria-label="Filter by Sector"
              className="appearance-none bg-[#3D1F44] text-xs font-semibold text-[#F8F5EE] border border-[#4F2B57] rounded-lg px-3.5 py-1.5 pr-8 hover:border-[#E8A8BF] focus:outline-none cursor-pointer"
            >
              <option value="Sector 7">Sector 7 (12 Active)</option>
              <option value="Sector 8">Sector 8 (8 Active)</option>
              <option value="Sector 4">Sector 4 (6 Active)</option>
              <option value="All Sectors">All Sectors (26 Active)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#D8C8DC] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Camera Quick Dropdown */}
          <div className="relative">
            <select
              value={selectedCamera?.id || ''}
              onChange={(e) => {
                const cam = cameras.find(c => c.id === e.target.value);
                if (cam) onSelectCamera(cam);
              }}
              aria-label="Select Camera Node"
              className="appearance-none bg-[#3D1F44] text-xs font-bold text-[#F8F5EE] border border-[#4F2B57] rounded-lg px-3.5 py-1.5 pr-8 hover:border-[#E8A8BF] focus:outline-none cursor-pointer"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#D8C8DC] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Locate Button matching reference */}
          <button
            onClick={() => {
              if (selectedCamera) {
                setScanMessage(`Located ${selectedCamera.id}`);
                setTimeout(() => setScanMessage(null), 3000);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E8A8BF] hover:bg-[#F0B8CD] text-[#28142E] text-xs font-bold transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-[#28142E]" />
            <span>Locate</span>
          </button>

          {/* Scan Network Button matching reference */}
          <button
            onClick={handleScanNetwork}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F3B6CA] hover:bg-[#F8C6D6] text-[#28142E] text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isScanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Radio className="w-3.5 h-3.5 text-[#28142E]" />
            )}
            <span>{isScanning ? 'Scanning...' : 'Scan Network'}</span>
          </button>

          {scanMessage && (
            <span className="text-[11px] font-mono text-[#F3B6CA] bg-[#3D1F44] px-2 py-1 rounded">
              {scanMessage}
            </span>
          )}
        </div>

        {/* Right Search & Notification Controls */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plate (e.g. DL-01-AB-1234)..."
              className="w-64 bg-[#3D1F44] border border-[#4F2B57] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F8F5EE] placeholder:text-[#9A849E] focus:outline-none focus:border-[#E8A8BF] font-mono"
            />
            <Search className="w-3.5 h-3.5 text-[#9A849E] absolute left-2.5 top-2.5" />
          </form>

          {/* Bell Icon */}
          <div className="relative cursor-pointer text-[#F8F5EE] hover:text-[#F3B6CA] transition">
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E86A67] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </div>

          {/* Settings Icon */}
          <div className="cursor-pointer text-[#F8F5EE] hover:text-[#F3B6CA] transition">
            <SettingsIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
