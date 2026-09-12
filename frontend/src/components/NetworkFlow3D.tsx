import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Icon } from './Icons';

export interface NetworkFlow3DProps {
  data: number[];
  secondaryData?: number[];
  labels: string[];
  height?: number;
  unit?: string;
  secondaryUnit?: string;
}

export function NetworkFlow3D({
  data,
  secondaryData,
  labels,
  height = 260,
  unit = 'veh/hr',
  secondaryUnit = 'km/h',
}: NetworkFlow3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewAngle, setViewAngle] = useState<'iso' | 'front' | 'top'>('iso');

  // Clean, safe datasets
  const safeData = useMemo(() => (data && data.length > 0 ? data : [100, 200, 300, 400, 500, 600]), [data]);
  const safeLabels = useMemo(() => (labels && labels.length > 0 ? labels : safeData.map((_, i) => `#${i + 1}`)), [labels, safeData]);
  const maxVal = useMemo(() => Math.max(...safeData, 1), [safeData]);
  const peakIdx = useMemo(() => safeData.indexOf(maxVal), [safeData, maxVal]);

  const sceneStateRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    pillars: THREE.Mesh[];
    highlightMesh?: THREE.Mesh;
    reqId?: number;
    theta: number;
    phi: number;
    radius: number;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
  }>({
    pillars: [],
    theta: Math.PI / 4.4,
    phi: Math.PI / 3.2,
    radius: 40,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const h = height;

    // 1. Setup Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const sState = sceneStateRef.current;
    sState.scene = scene;
    sState.camera = camera;
    sState.renderer = renderer;

    // 2. Soft, Premium Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(20, 35, 25);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.6);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 3. Clean Minimalist Base Podium
    const baseGeo = new THREE.BoxGeometry(42, 0.4, 10);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.1,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -0.2, 0);
    base.receiveShadow = true;
    scene.add(base);

    // Subtle reference level lines on base
    const gridHelper = new THREE.GridHelper(40, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 4. Create Refined, Rounded 3D Architectural Columns
    const count = safeData.length;
    const spacing = 1.45;
    const startX = -((count - 1) * spacing) / 2;
    const pillars: THREE.Mesh[] = [];

    safeData.forEach((val, i) => {
      const normalized = val / maxVal;
      const pillarHeight = Math.max(0.5, normalized * 11);
      const x = startX + i * spacing;
      const z = 0;

      // Calm, sophisticated corporate palette
      let pillarColor = 0x2563eb; // Royal Blue
      if (i === peakIdx) {
        pillarColor = 0xf59e0b; // Warm Amber Peak Highlight
      } else if (normalized > 0.75) {
        pillarColor = 0x3b82f6; // Sky Sapphire
      } else if (normalized < 0.3) {
        pillarColor = 0x1d4ed8; // Deep Blue Trough
      }

      const geo = new THREE.BoxGeometry(0.92, pillarHeight, 0.92);
      const mat = new THREE.MeshStandardMaterial({
        color: pillarColor,
        roughness: 0.32,
        metalness: 0.12,
        transparent: true,
        opacity: 0.95,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, pillarHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { index: i, value: val, height: pillarHeight };

      scene.add(mesh);
      pillars.push(mesh);

      // Subtle Top Cap Lid
      const capGeo = new THREE.PlaneGeometry(0.9, 0.9);
      const capMat = new THREE.MeshBasicMaterial({
        color: i === peakIdx ? 0xfef08a : 0x93c5fd,
        side: THREE.DoubleSide,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = -Math.PI / 2;
      cap.position.set(x, pillarHeight + 0.01, z);
      scene.add(cap);
    });

    sState.pillars = pillars;

    // 5. Clean Hover Highlight Wireframe
    const hiGeo = new THREE.BoxGeometry(1.05, 1, 1.05);
    const hiMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const highlightMesh = new THREE.Mesh(hiGeo, hiMat);
    highlightMesh.visible = false;
    scene.add(highlightMesh);
    sState.highlightMesh = highlightMesh;

    // 6. Camera Orbit Position updater (Static by default)
    const updateCameraPos = () => {
      const { radius, theta, phi } = sState;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 3.5, 0);
    };
    updateCameraPos();

    // 7. Render Loop (Only renders when needed or during user drag)
    const animate = () => {
      renderer.render(scene, camera);
      sState.reqId = requestAnimationFrame(animate);
    };

    sState.reqId = requestAnimationFrame(animate);

    // 8. User Interaction: Click & Drag to inspect, Raycasting on Hover
    const onMouseDown = (e: MouseEvent) => {
      sState.isDragging = true;
      sState.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pillars);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const hitIdx = hit.userData.index;
        setHoveredIdx(hitIdx);

        if (highlightMesh) {
          highlightMesh.visible = true;
          highlightMesh.scale.set(1, hit.userData.height, 1);
          highlightMesh.position.copy(hit.position);
        }
      } else {
        setHoveredIdx(null);
        if (highlightMesh) highlightMesh.visible = false;
      }

      if (!sState.isDragging) return;
      const dx = e.clientX - sState.prevMousePos.x;
      const dy = e.clientY - sState.prevMousePos.y;
      sState.prevMousePos = { x: e.clientX, y: e.clientY };

      sState.theta -= dx * 0.007;
      sState.phi = Math.max(0.15, Math.min(Math.PI / 2.05, sState.phi - dy * 0.007));
      updateCameraPos();
    };

    const onMouseUp = () => {
      sState.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sState.radius = Math.max(22, Math.min(55, sState.radius + e.deltaY * 0.025));
      updateCameraPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      camera.aspect = nw / height;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (sState.reqId) cancelAnimationFrame(sState.reqId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [safeData, maxVal, peakIdx, height]);

  // Clean Camera Presets
  const setPreset = (angle: 'iso' | 'front' | 'top') => {
    setViewAngle(angle);
    const sState = sceneStateRef.current;
    if (!sState.camera) return;

    if (angle === 'iso') {
      sState.theta = Math.PI / 4.4;
      sState.phi = Math.PI / 3.2;
      sState.radius = 40;
    } else if (angle === 'front') {
      sState.theta = 0;
      sState.phi = Math.PI / 2.05;
      sState.radius = 38;
    } else {
      sState.theta = 0.01;
      sState.phi = 0.12;
      sState.radius = 36;
    }

    const { radius, theta, phi } = sState;
    sState.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    sState.camera.position.y = radius * Math.cos(phi);
    sState.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    sState.camera.lookAt(0, 3.5, 0);
  };

  const hoveredVal = hoveredIdx !== null ? safeData[hoveredIdx] : null;
  const hoveredSecVal = hoveredIdx !== null && secondaryData ? secondaryData[hoveredIdx] : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-clay/30 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
      {/* Clean 3D Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            3D Corridor Flow Distribution
          </span>
        </div>

        {/* Minimalist Camera Angle Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPreset('iso')}
            className={`rounded px-2 py-0.5 transition-colors ${
              viewAngle === 'iso' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric
          </button>
          <button
            type="button"
            onClick={() => setPreset('front')}
            className={`rounded px-2 py-0.5 transition-colors ${
              viewAngle === 'front' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Front Elevation
          </button>
          <button
            type="button"
            onClick={() => setPreset('top')}
            className={`rounded px-2 py-0.5 transition-colors ${
              viewAngle === 'top' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Plan
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas (Calm & Static) */}
      <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height }} />

      {/* Clean Bottom Tooltip HUD (When hovering a 3D bar) */}
      {hoveredIdx !== null ? (
        <div className="pointer-events-none absolute bottom-4 left-4 z-30 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-slate-950/90 px-3.5 py-2.5 text-white shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400">{safeLabels[hoveredIdx]}</span>
              {hoveredIdx === peakIdx && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 uppercase">
                  Peak Rush
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-baseline gap-3">
              <span className="font-display text-base font-bold text-white">
                {hoveredVal?.toLocaleString()} <span className="text-xs font-normal text-slate-400">{unit}</span>
              </span>
              {hoveredSecVal !== null && (
                <span className="text-xs font-semibold text-blue-300">
                  Avg Speed: {hoveredSecVal} {secondaryUnit}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute bottom-3 left-4 text-xs font-medium text-slate-400">
          <span>💡 Hover any column to inspect time window details</span>
        </div>
      )}

      {/* Subtle Drag Hint */}
      <div className="pointer-events-none absolute bottom-3 right-4 text-right text-[11px] font-medium text-slate-500">
        <span>Click & drag to tilt view</span>
      </div>
    </div>
  );
}

