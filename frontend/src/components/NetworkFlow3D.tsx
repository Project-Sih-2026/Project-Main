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
  height = 280,
  unit = 'veh/hr',
  secondaryUnit = 'km/h',
}: NetworkFlow3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewAngle, setViewAngle] = useState<'3d' | 'top'>('3d');
  const [showParticles, setShowParticles] = useState(true);

  // Safe dataset
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
    particles?: THREE.Points;
    reqId?: number;
    theta: number;
    phi: number;
    radius: number;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
  }>({
    pillars: [],
    theta: Math.PI / 4.2,
    phi: Math.PI / 3.4,
    radius: 42,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Three.js Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const h = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 1000);
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

    // 2. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainSpot = new THREE.DirectionalLight(0x38bdf8, 1.8);
    mainSpot.position.set(20, 40, 20);
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    const accentLight = new THREE.PointLight(0xa855f7, 2.2, 80);
    accentLight.position.set(-20, 25, -15);
    scene.add(accentLight);

    const floorLight = new THREE.PointLight(0x0284c7, 1.5, 50);
    floorLight.position.set(0, 5, 0);
    scene.add(floorLight);

    // 3. Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(50, 25, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Subtle Ground Disc Reflection Plane
    const floorGeo = new THREE.PlaneGeometry(60, 40);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x070d18,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    scene.add(floor);

    // 4. Create Volumetric 3D Pillars for Traffic Flow
    const count = safeData.length;
    const spacing = 1.45;
    const startX = -((count - 1) * spacing) / 2;
    const pillars: THREE.Mesh[] = [];

    // Ribbon curve points for speed flow
    const ribbonPoints: THREE.Vector3[] = [];

    safeData.forEach((val, i) => {
      const normalized = val / maxVal;
      const pillarHeight = Math.max(0.6, normalized * 13);
      const x = startX + i * spacing;
      const z = 0;

      // Color interpolation: Low (Cyan) -> Mid (Blue/Indigo) -> High (Flame Amber/Crimson)
      let hexColor = 0x0284c7;
      if (normalized > 0.8) {
        hexColor = 0xf43f5e; // Crimson Peak
      } else if (normalized > 0.6) {
        hexColor = 0xf59e0b; // Amber Warning
      } else if (normalized > 0.35) {
        hexColor = 0x6366f1; // Electric Indigo
      } else {
        hexColor = 0x0ea5e9; // Sky Cyan
      }

      // Rounded/Chamfered Look using BoxGeometry
      const geo = new THREE.BoxGeometry(0.95, pillarHeight, 0.95);
      const mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.18,
        metalness: 0.75,
        emissive: hexColor,
        emissiveIntensity: normalized > 0.8 ? 0.45 : 0.2,
        transparent: true,
        opacity: 0.92,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, pillarHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { index: i, value: val, height: pillarHeight };

      scene.add(mesh);
      pillars.push(mesh);

      // Add Top Glowing Cap
      const capGeo = new THREE.PlaneGeometry(0.9, 0.9);
      const capMat = new THREE.MeshBasicMaterial({
        color: normalized > 0.8 ? 0xffffff : 0xbae6fd,
        side: THREE.DoubleSide,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = -Math.PI / 2;
      cap.position.set(x, pillarHeight + 0.02, z);
      scene.add(cap);

      // Track ribbon point
      ribbonPoints.push(new THREE.Vector3(x, pillarHeight + 2.2, z));
    });

    sState.pillars = pillars;

    // 5. 3D Speed Stream Ribbon above Pillars
    if (ribbonPoints.length > 2) {
      const curve = new THREE.CatmullRomCurve3(ribbonPoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(tube);
    }

    // 6. 3D Particle Vehicle Flow Trajectory
    const particleCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pVel = new Float32Array(particleCount);

    for (let p = 0; p < particleCount; p++) {
      const rIdx = Math.random() * (count - 1);
      const px = startX + rIdx * spacing;
      const normalizedH = (safeData[Math.floor(rIdx)] || 0) / maxVal;
      pPos[p * 3] = px;
      pPos[p * 3 + 1] = Math.random() * normalizedH * 12 + 0.5;
      pPos[p * 3 + 2] = (Math.random() - 0.5) * 6;
      pVel[p] = 0.04 + Math.random() * 0.08;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    sState.particles = particles;

    // 7. Peak Beacon Indicator Ring
    if (peakIdx >= 0 && pillars[peakIdx]) {
      const peakMesh = pillars[peakIdx];
      const ringGeo = new THREE.RingGeometry(0.8, 1.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(peakMesh.position.x, peakMesh.userData.height + 1.2, 0);
      scene.add(ring);

      // Light column beacon
      const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 4, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.65,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(peakMesh.position.x, peakMesh.userData.height + 2, 0);
      scene.add(beacon);
    }

    // 8. Hover Highlight Mesh
    const hiGeo = new THREE.BoxGeometry(1.08, 1, 1.08);
    const hiMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const highlightMesh = new THREE.Mesh(hiGeo, hiMat);
    highlightMesh.visible = false;
    scene.add(highlightMesh);
    sState.highlightMesh = highlightMesh;

    // 9. Camera Orbit Position updater
    const updateCameraPos = () => {
      const { radius, theta, phi } = sState;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 4.5, 0);
    };
    updateCameraPos();

    // 10. Animation Loop
    let clock = 0;
    const animate = () => {
      clock += 0.015;

      // Auto-Orbit
      if (autoRotate && !sState.isDragging) {
        sState.theta += 0.003;
        updateCameraPos();
      }

      // Animate Particle Streams
      if (showParticles && particles) {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for (let p = 0; p < particleCount; p++) {
          positions[p * 3] += pVel[p];
          if (positions[p * 3] > (count * spacing) / 2) {
            positions[p * 3] = startX;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      sState.reqId = requestAnimationFrame(animate);
    };

    sState.reqId = requestAnimationFrame(animate);

    // 11. Mouse / Touch Orbit Event Handlers
    const onMouseDown = (e: MouseEvent) => {
      sState.isDragging = true;
      sState.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Raycasting for Pillar Hover
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

      sState.theta -= dx * 0.008;
      sState.phi = Math.max(0.2, Math.min(Math.PI / 2.1, sState.phi - dy * 0.008));
      updateCameraPos();
    };

    const onMouseUp = () => {
      sState.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sState.radius = Math.max(18, Math.min(65, sState.radius + e.deltaY * 0.03));
      updateCameraPos();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Handle Window Resize
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
  }, [safeData, maxVal, peakIdx, height, autoRotate, showParticles]);

  // Quick Camera Presets
  const setPreset = (type: '3d' | 'top') => {
    setViewAngle(type);
    const sState = sceneStateRef.current;
    if (!sState.camera) return;
    if (type === '3d') {
      sState.theta = Math.PI / 4.2;
      sState.phi = Math.PI / 3.4;
      sState.radius = 42;
    } else {
      sState.theta = 0.01;
      sState.phi = 0.15;
      sState.radius = 38;
    }
    const { radius, theta, phi } = sState;
    sState.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    sState.camera.position.y = radius * Math.cos(phi);
    sState.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    sState.camera.lookAt(0, 4.5, 0);
  };

  const hoveredVal = hoveredIdx !== null ? safeData[hoveredIdx] : null;
  const hoveredSecVal = hoveredIdx !== null && secondaryData ? secondaryData[hoveredIdx] : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950/80 p-2 shadow-2xl backdrop-blur-md">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" style={{ height }} />

      {/* Top Floating Cyber HUD Badges */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-slate-900/90 px-2.5 py-1 text-[11px] font-bold text-sky-400 backdrop-blur shadow-lg">
          <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
          3D CORRIDOR HOLOGRAM
        </span>
        <span className="rounded-lg border border-slate-700/60 bg-slate-900/80 px-2 py-1 text-[10px] font-mono text-slate-400 backdrop-blur">
          {safeData.length} NODES RENDERED
        </span>
      </div>

      {/* Interactive 3D Orbit & Viewport Toolbar */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/90 p-1 backdrop-blur shadow-xl">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-bold transition-all ${
            autoRotate ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Auto-Orbit"
        >
          <Icon name="refresh" className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Orbit On' : 'Orbit Off'}</span>
        </button>

        <button
          type="button"
          onClick={() => setPreset(viewAngle === '3d' ? 'top' : '3d')}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-bold text-slate-300 hover:bg-slate-800 transition-all"
          title="Toggle Camera Angle"
        >
          <Icon name="layers" className="h-3 w-3 text-amber-400" />
          <span>{viewAngle === '3d' ? '3D Angled' : 'Top Down'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowParticles(!showParticles)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10.5px] font-bold transition-all ${
            showParticles ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Vehicle Flow Particles"
        >
          <Icon name="activity" className="h-3 w-3" />
          <span>Particles</span>
        </button>
      </div>

      {/* Interactive Holographic Telemetry Readout (When hovering a 3D pillar) */}
      {hoveredIdx !== null && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex items-center gap-3 rounded-xl border border-sky-500/50 bg-slate-900/95 p-3 text-white shadow-2xl backdrop-blur-md animate-fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold">
            <Icon name="car" className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-300">{safeLabels[hoveredIdx]}</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-sky-300">
                {hoveredVal! > maxVal * 0.8 ? 'Peak Congestion' : hoveredVal! > maxVal * 0.4 ? 'Moderate Flow' : 'Free Flow'}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-3">
              <span className="font-display text-lg font-bold text-white">
                {hoveredVal?.toLocaleString()} <span className="text-xs font-normal text-slate-400">{unit}</span>
              </span>
              {hoveredSecVal !== null && (
                <span className="text-xs font-semibold text-amber-400">
                  ⚡ {hoveredSecVal} {secondaryUnit}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D Navigation Guide Tip */}
      <div className="pointer-events-none absolute bottom-3 right-3 text-right text-[10px] font-semibold text-slate-400/80">
        <span>🖱️ Drag to rotate 3D view · Scroll to zoom</span>
      </div>
    </div>
  );
}
