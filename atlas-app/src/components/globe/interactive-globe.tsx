'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useAtlasStore } from '@/lib/store';
import { Location } from '@/types';
import { reverseGeocode } from '@/lib/geocoding';
import { Plus, BookmarkCheck, X, MapPin, Sparkles, Navigation, Globe as GlobeIcon, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// 1. GEOMETRY & COORDINATE HELPERS
// ============================================================================

// Convert Latitude and Longitude to 3D Cartesian coordinates on sphere of radius R
export function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Convert 3D Point on local sphere to Latitude and Longitude
export function vector3ToLatLong(vec: THREE.Vector3): { lat: number; lon: number } {
  const u = vec.clone().normalize();
  const phi = Math.acos(Math.max(-1, Math.min(1, u.y)));
  const lat = 90 - (phi * 180) / Math.PI;
  let lon = (Math.atan2(u.z, -u.x) * 180) / Math.PI - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

// ============================================================================
// 2. MAIN INTERACTIVE GLOBE COMPONENT
// ============================================================================

export default function InteractiveGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    locations,
    experiences,
    wishlistItems,
    filterType,
    selectedCategory,
    selectedYear,
    setSelectedLocation,
    flyToTarget,
    globeVisualTheme,
    setPendingLocation,
    setExperienceModalOpen,
    setWishlistModalOpen,
  } = useAtlasStore();

  // Hover states
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoveredExp, setHoveredExp] = useState<{ count: number; photo?: string; rating?: number; category?: string } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clicked point on Earth (for arbitrary on-demand pins)
  const [clickedSpot, setClickedSpot] = useState<{
    lat: number;
    lon: number;
    x: number;
    y: number;
    name?: string;
    city?: string;
    country?: string;
    venue?: string;
    isLoading?: boolean;
  } | null>(null);

  // Persistent Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const earthMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const userMarkersGroupRef = useRef<THREE.Group | null>(null);
  const activePinRef = useRef<THREE.Group | null>(null);
  const markerHitMeshesRef = useRef<THREE.Mesh[]>([]);

  // Physics & Animation State
  const rotXRef = useRef<number>(0.2);
  const rotYRef = useRef<number>(0);
  const targetRotXRef = useRef<number>(0.2);
  const targetRotYRef = useRef<number>(0);
  const zoomDistanceRef = useRef<number>(285);
  const targetZoomDistanceRef = useRef<number>(285);
  const isDraggingRef = useRef<boolean>(false);
  const isFlyingRef = useRef<boolean>(false);

  // Filter visible user locations based on active filters
  const visibleUserMarkers = useMemo(() => {
    return locations.map((loc) => {
      const locExperiences = experiences.filter((e) => {
        if (e.location_id !== loc.id) return false;
        if (selectedCategory && e.category_id !== selectedCategory) return false;
        if (selectedYear && new Date(e.date).getFullYear() !== selectedYear) return false;
        return true;
      });

      const locWishlist = wishlistItems.filter((w) => {
        if (w.location_id !== loc.id || w.is_completed) return false;
        if (selectedCategory && w.category_id !== selectedCategory) return false;
        return true;
      });

      const hasExperienced = locExperiences.length > 0;
      const hasWishlist = locWishlist.length > 0;

      let shouldShow = false;
      let markerType: 'experienced' | 'wishlist' = 'experienced';

      if (filterType === 'all') {
        shouldShow = hasExperienced || hasWishlist;
        markerType = hasExperienced ? 'experienced' : 'wishlist';
      } else if (filterType === 'experienced') {
        shouldShow = hasExperienced;
        markerType = 'experienced';
      } else if (filterType === 'wishlist') {
        shouldShow = hasWishlist;
        markerType = 'wishlist';
      }

      const primaryExp = locExperiences[0];
      const primaryWish = locWishlist[0];

      return {
        location: loc,
        shouldShow,
        markerType,
        count: locExperiences.length + locWishlist.length,
        experiences: locExperiences,
        photo: primaryExp?.cover_image_url || primaryExp?.media?.[0]?.file_url || undefined,
        rating: primaryExp?.rating || undefined,
        category: primaryExp?.category_id || primaryWish?.category_id || undefined,
      };
    }).filter((m) => m.shouldShow);
  }, [locations, experiences, wishlistItems, filterType, selectedCategory, selectedYear]);

  // ============================================================================
  // 4. INITIALIZE THREE.JS SCENE ON MOUNT
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;

    // 1. Scene with Warm Comic Sky Background (#FFF4D9)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdf4dc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.set(0, 0, 285);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Earth Master Group
    const earthRadius = 100;
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 5. Lighting Setup (Bright cartoon daylight sunlight + warm fill ambient)
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 1.35); // Warm cream sunlight
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.1);
    sunLight.position.set(160, 120, 200);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.85); // Blue rim backlight
    rimLight.position.set(-160, -80, -180);
    scene.add(rimLight);

    // 6. Texture Loader for Local Pre-Generated Gamified Earth Maps
    const textureLoader = new THREE.TextureLoader();

    // Graphic Pop Texture
    const popTexture = textureLoader.load('/textures/earth_gamified_pop.png');
    popTexture.wrapS = THREE.RepeatWrapping;
    popTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Pixel Art Texture
    const pixelTexture = textureLoader.load('/textures/earth_gamified_pixel.png');
    pixelTexture.minFilter = THREE.NearestFilter;
    pixelTexture.magFilter = THREE.NearestFilter;
    pixelTexture.wrapS = THREE.RepeatWrapping;
    pixelTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Specular Map (glistening ocean sheen)
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg');

    // Initial Material
    const initialTexture = globeVisualTheme === 'graphic' ? popTexture : pixelTexture;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: initialTexture,
      specularMap: specularTexture,
      specular: new THREE.Color(0xa5f3fc), // Sparkling cyan sheen on water
      shininess: 36,
      color: new THREE.Color(0xffffff),
    });
    earthMatRef.current = earthMat;

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.name = 'EarthSurface';
    earthGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 7. Drifting Stylized Cartoon Cloud Layer (Light, sparse aesthetic puffs)
    const cloudTexture = textureLoader.load('/textures/earth_clouds_gamified.png');
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.025, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.50,
      blending: THREE.NormalBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.name = 'CloudLayer';
    earthGroup.add(cloudMesh);

    // 8. Cloud Shadow Layer (Subtle ambient depth on continents below)
    const cloudShadowGeo = new THREE.SphereGeometry(earthRadius * 1.006, 64, 64);
    const cloudShadowMat = new THREE.MeshBasicMaterial({
      map: cloudTexture,
      color: 0x0f172a,
      transparent: true,
      opacity: 0.05,
      blending: THREE.MultiplyBlending,
      premultipliedAlpha: true,
    });
    const cloudShadowMesh = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
    earthGroup.add(cloudShadowMesh);

    // 14. Groups for User Markers & Active Target Pin
    const userMarkersGroup = new THREE.Group();
    earthGroup.add(userMarkersGroup);
    userMarkersGroupRef.current = userMarkersGroup;

    const activePinGroup = new THREE.Group();
    earthGroup.add(activePinGroup);
    activePinRef.current = activePinGroup;

    markerHitMeshesRef.current = [];

    // 16. POINTER & INTERACTION CONTROLS
    let prevX = 0;
    let prevY = 0;
    let startX = 0;
    let startY = 0;
    let touchStartDist = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevX = e.clientX;
      prevY = e.clientY;
      startX = e.clientX;
      startY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (isDraggingRef.current) {
        const dx = clientX - prevX;
        const dy = clientY - prevY;

        targetRotYRef.current += dx * 0.005;
        targetRotXRef.current += dy * 0.005;
        targetRotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotXRef.current));

        prevX = clientX;
        prevY = clientY;
        isFlyingRef.current = false;
      }

      // Hover Raycasting
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerHitMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData?.location) {
          setHoveredLocation(hit.userData.location);
          setHoveredExp({
            count: hit.userData.count || 1,
            photo: hit.userData.photo,
            rating: hit.userData.rating,
            category: hit.userData.category,
          });
          setMousePos({ x: clientX, y: clientY });
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredLocation(null);
        setHoveredExp(null);
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dragDist = Math.hypot(e.clientX - startX, e.clientY - startY);
      isDraggingRef.current = false;
      container.style.cursor = 'grab';

      // Distinguish deliberate click from orbital drag (< 6px movement)
      if (dragDist < 6) {
        handleGlobeClick(e.clientX, e.clientY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomDistanceRef.current += e.deltaY * 0.18;
      targetZoomDistanceRef.current = Math.max(160, Math.min(480, targetZoomDistanceRef.current));
    };

    // Mobile multi-touch pinch zoom
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = (touchStartDist - dist) * 0.4;
        targetZoomDistanceRef.current = Math.max(160, Math.min(480, targetZoomDistanceRef.current + factor));
        touchStartDist = dist;
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || window.innerHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Click handler for User Markers or 3D Earth surface
    const handleGlobeClick = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // 1. Check User Markers first
      const markerIntersects = raycaster.intersectObjects(markerHitMeshesRef.current);
      if (markerIntersects.length > 0) {
        const hit = markerIntersects[0].object as THREE.Mesh;
        if (hit.userData?.location) {
          const loc = hit.userData.location as Location;
          setSelectedLocation(loc);
          setClickedSpot(null);
          clearActiveTargetPin();

          const targetPhi = (loc.latitude * Math.PI) / 180;
          const targetTheta = -(loc.longitude * Math.PI) / 180 - Math.PI / 2;
          targetRotXRef.current = targetPhi;
          targetRotYRef.current = targetTheta;
          targetZoomDistanceRef.current = 205;
          isFlyingRef.current = true;
          return;
        }
      }

      // 2. Check click on 3D Earth surface for custom pin-drop
      const earthIntersects = raycaster.intersectObject(earthMesh);
      if (earthIntersects.length > 0) {
        const hitPoint = earthIntersects[0].point.clone();
        hitPoint.applyMatrix4(earthGroup.matrixWorld.clone().invert());
        const { lat, lon } = vector3ToLatLong(hitPoint);

        renderActiveTargetPin(lat, lon);
        setSelectedLocation(null);

        setClickedSpot({
          lat,
          lon,
          x: clientX,
          y: clientY,
          isLoading: true,
        });

        // Reverse geocode real GPS location via Nominatim in background
        reverseGeocode(lat, lon).then((info) => {
          setClickedSpot((prev) => {
            if (!prev || Math.abs(prev.lat - lat) > 0.01) return prev;
            return {
              ...prev,
              name: info?.name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
              city: info?.city || '',
              country: info?.country || 'Earth',
              venue: info?.venue || '',
              isLoading: false,
            };
          });
        });
      } else {
        setClickedSpot(null);
        clearActiveTargetPin();
      }
    };

    // Render gamified 3D target beacon on clicked GPS point
    const renderActiveTargetPin = (lat: number, lon: number) => {
      if (!activePinRef.current) return;
      const group = activePinRef.current;
      group.clear();

      const pos = latLongToVector3(lat, lon, earthRadius);
      group.position.copy(pos);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      // Slender pole
      const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 8, 6);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0x171313 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 4;
      group.add(pole);

      // Glowing Tomato Red diamond
      const headGeo = new THREE.OctahedronGeometry(2.8, 0);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xF04432,
        emissive: 0xF04432,
        emissiveIntensity: 0.9,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 8 + 2.8;
      group.add(head);
    };

    const clearActiveTargetPin = () => {
      if (activePinRef.current) {
        activePinRef.current.clear();
      }
    };

    // 17. MAIN 60FPS ANIMATION LOOP
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera damping & rotation
      rotXRef.current += (targetRotXRef.current - rotXRef.current) * 0.08;
      rotYRef.current += (targetRotYRef.current - rotYRef.current) * 0.08;
      zoomDistanceRef.current += (targetZoomDistanceRef.current - zoomDistanceRef.current) * 0.08;

      // Passive planetary rotation when not dragging
      if (!isDraggingRef.current && !isFlyingRef.current) {
        targetRotYRef.current += 0.0006;
      }

      // Apply Earth orientation
      earthGroup.rotation.x = rotXRef.current;
      earthGroup.rotation.y = rotYRef.current;

      // Drifting clouds rotation
      cloudMesh.rotation.y += 0.0004;
      cloudShadowMesh.rotation.y += 0.0004;

      // Update camera position along spherical radius
      camera.position.z = zoomDistanceRef.current;

      // Check if finished flying
      if (isFlyingRef.current) {
        if (
          Math.abs(rotXRef.current - targetRotXRef.current) < 0.005 &&
          Math.abs(rotYRef.current - targetRotYRef.current) < 0.005
        ) {
          isFlyingRef.current = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [setSelectedLocation, globeVisualTheme]);

  // ============================================================================
  // 5. REACTIVE USER MEMORY / WISHLIST MARKERS
  // ============================================================================
  useEffect(() => {
    if (!userMarkersGroupRef.current) return;
    const userMarkersGroup = userMarkersGroupRef.current;
    userMarkersGroup.clear();
    markerHitMeshesRef.current = [];

    const earthRadius = 100;

    visibleUserMarkers.forEach(({ location, markerType, count, photo, rating, category }) => {
      const pos = latLongToVector3(location.latitude, location.longitude, earthRadius);

      const markerSubGroup = new THREE.Group();
      markerSubGroup.position.copy(pos);
      markerSubGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      const isExperienced = markerType === 'experienced';
      const pinColor = isExperienced ? 0xF04432 : 0xFFD45A; // Tomato Red or Sunflower Yellow
      const emissiveColor = isExperienced ? 0x991b1b : 0xb45309;

      // 1. Chunky 3D Needle Stem
      const stemHeight = 7.5;
      const stemGeo = new THREE.BoxGeometry(0.8, stemHeight, 0.8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0x171313 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = stemHeight / 2;
      markerSubGroup.add(stemMesh);

      // 2. Chunky 3D Gem / Diamond Marker Head
      const headRadius = isExperienced ? 3.4 : 3.0;
      const headGeo = new THREE.OctahedronGeometry(headRadius, 0);
      const headMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.75,
        roughness: 0.15,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.y = stemHeight + headRadius;
      headMesh.rotation.y = Math.PI / 4;
      headMesh.userData = { location, markerType, count, photo, rating, category };
      markerSubGroup.add(headMesh);
      markerHitMeshesRef.current.push(headMesh);

      // 3. Thick Black Pixel Edge Framing on Gem Head
      const wireGeo = new THREE.WireframeGeometry(headGeo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0x171313, linewidth: 2 });
      const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
      wireMesh.position.y = stemHeight + headRadius;
      wireMesh.rotation.y = Math.PI / 4;
      markerSubGroup.add(wireMesh);

      userMarkersGroup.add(markerSubGroup);
    });
  }, [visibleUserMarkers]);

  // ============================================================================
  // 6. REACTIVE STYLE SWITCHER (16-Bit Pixel vs Graphic Pop)
  // ============================================================================
  useEffect(() => {
    if (!earthMatRef.current) return;
    const loader = new THREE.TextureLoader();

    if (globeVisualTheme === 'graphic') {
      const popTex = loader.load('/textures/earth_gamified_pop.png');
      earthMatRef.current.map = popTex;
      earthMatRef.current.needsUpdate = true;
    } else {
      const pixelTex = loader.load('/textures/earth_gamified_pixel.png');
      pixelTex.minFilter = THREE.NearestFilter;
      pixelTex.magFilter = THREE.NearestFilter;
      earthMatRef.current.map = pixelTex;
      earthMatRef.current.needsUpdate = true;
    }
  }, [globeVisualTheme]);

  // ============================================================================
  // 7. REACTIVE CAMERA FLY-TO
  // ============================================================================
  useEffect(() => {
    if (!flyToTarget) return;

    const targetPhi = (flyToTarget.latitude * Math.PI) / 180;
    const targetTheta = -(flyToTarget.longitude * Math.PI) / 180 - Math.PI / 2;

    targetRotXRef.current = targetPhi;
    targetRotYRef.current = targetTheta;
    targetZoomDistanceRef.current = flyToTarget.altitude || 205;
    isFlyingRef.current = true;
  }, [flyToTarget]);

  // Handlers for clicked arbitrary location card
  const handleRecordFromClick = () => {
    if (!clickedSpot) return;
    setPendingLocation({
      latitude: clickedSpot.lat,
      longitude: clickedSpot.lon,
      name: clickedSpot.name,
      city: clickedSpot.city,
      country: clickedSpot.country,
      venue: clickedSpot.venue,
    });
    setExperienceModalOpen(true);
    setClickedSpot(null);
  };

  const handleWishlistFromClick = () => {
    if (!clickedSpot) return;
    setPendingLocation({
      latitude: clickedSpot.lat,
      longitude: clickedSpot.lon,
      name: clickedSpot.name,
      city: clickedSpot.city,
      country: clickedSpot.country,
      venue: clickedSpot.venue,
    });
    setWishlistModalOpen(true);
    setClickedSpot(null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden select-none bg-[#fdf4dc]">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing" />

      {/* Hover Experience Preview Tooltip Card (User Memory) */}
      {hoveredLocation && !clickedSpot && (
        <div
          className="fixed pointer-events-none z-40 bg-[#FFF4D9] border-2 border-[#171313] rounded-2xl p-3 shadow-pop-lg transform -translate-x-1/2 -translate-y-24 transition-all duration-75 max-w-[250px] select-none"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          {hoveredExp?.photo && (
            <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-[#171313] border-2 border-[#171313]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hoveredExp.photo}
                alt={hoveredLocation.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F04432] border border-[#171313] shrink-0" />
            <p className="text-xs font-black text-[#171313] truncate font-sans">
              {hoveredLocation.name}
            </p>
          </div>
          <p className="text-[11px] font-bold text-[#171313]/70 mt-0.5 truncate">
            {[hoveredLocation.city, hoveredLocation.country].filter(Boolean).join(', ')}
          </p>
          {hoveredExp?.rating && (
            <div className="flex items-center gap-1 mt-1 text-[#F04432] text-xs font-black">
              <span>★</span>
              <span>{hoveredExp.rating.toFixed(1)}</span>
              <span className="text-[10px] text-[#171313]/60 font-bold">
                • {hoveredExp.count} {hoveredExp.count === 1 ? 'memory' : 'memories'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Clicked Arbitrary Earth Spot Action Popover */}
      {clickedSpot && (
        <div
          className="fixed z-40 bg-[#FFF4D9] border-3 border-[#171313] rounded-3xl p-4 shadow-pop-lg transform -translate-x-1/2 -translate-y-36 max-w-xs w-72 select-none animate-in fade-in zoom-in-95 duration-150"
          style={{ left: Math.max(160, Math.min(window.innerWidth - 160, clickedSpot.x)), top: Math.max(140, clickedSpot.y) }}
        >
          {/* Close button */}
          <button
            onClick={() => setClickedSpot(null)}
            className="absolute top-2.5 right-2.5 p-1 rounded-full text-[#171313]/60 hover:text-[#171313] hover:bg-[#FFD45A] border border-transparent hover:border-[#171313] transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <div className="flex items-start gap-2.5 pr-6">
            <div className="w-8 h-8 rounded-xl bg-[#6425F5] text-white flex items-center justify-center border border-[#171313] shrink-0 shadow-pop-sm">
              <MapPin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-[#171313] truncate">
                {clickedSpot.isLoading ? 'Pinning Location…' : clickedSpot.name || 'Selected Location'}
              </h4>
              <p className="text-[11px] font-bold text-[#171313]/70 truncate">
                {clickedSpot.lat.toFixed(2)}°, {clickedSpot.lon.toFixed(2)}°
                {clickedSpot.country ? ` • ${clickedSpot.country}` : ''}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t-2 border-[#171313]/15">
            <button
              onClick={handleRecordFromClick}
              className="flex-1 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#F04432] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Record</span>
            </button>
            <button
              onClick={handleWishlistFromClick}
              className="px-3 py-1.5 rounded-xl text-xs font-black text-[#171313] bg-[#FFD45A] border-2 border-[#171313] shadow-pop-sm hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <BookmarkCheck className="w-3 h-3 stroke-[2.5]" />
              <span>Wishlist</span>
            </button>
          </div>
        </div>
      )}

      {/* Daylight Atmospheric Ambient Vignette */}
      <div className="pointer-events-none absolute inset-0 vignette-radial" />

      {/* Cheerful Gamified Legend & Instruction Box (Aligned Bottom-Left) */}
      <div className="absolute bottom-5 left-6 z-20 bg-[#FFF4D9]/95 backdrop-blur-xl border-2 border-[#171313] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#171313] flex items-center gap-3 shadow-pop-sm select-none pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F04432] border border-[#171313] shadow-2xs shrink-0" />
            <span className="font-black text-[#171313]">Memories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD45A] border border-[#171313] shadow-2xs shrink-0" />
            <span className="font-black text-[#171313]">Wishlist</span>
          </div>
        </div>
        <span className="w-px h-3.5 bg-[#171313]/25 hidden sm:inline-block" />
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-black text-[#171313]/75">
          <span>🖱️ Drag to rotate</span>
          <span className="text-[#171313]/30">•</span>
          <span>🔍 Scroll to zoom</span>
          <span className="text-[#171313]/30">•</span>
          <span className="text-[#6425F5]">📍 Click globe to drop a pin</span>
        </div>
        <div className="hidden sm:flex lg:hidden items-center gap-1.5 text-[11px] font-black text-[#6425F5]">
          <span>📍 Click globe to drop a pin</span>
        </div>
      </div>
    </div>
  );
}
