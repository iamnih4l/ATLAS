'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useAtlasStore } from '@/lib/store';
import { Location } from '@/types';

// Convert Latitude and Longitude to 3D Cartesian coordinates on a sphere of radius R
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

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
    setFlyToTarget,
  } = useAtlasStore();

  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter visible locations based on current filters
  const visibleMarkers = useMemo(() => {
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

      return {
        location: loc,
        shouldShow,
        markerType,
        count: locExperiences.length + locWishlist.length,
        experiences: locExperiences,
      };
    }).filter((m) => m.shouldShow);
  }, [locations, experiences, wishlistItems, filterType, selectedCategory, selectedYear]);

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 320);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Earth Group
    const earthRadius = 100;
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Starfield Background
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1200;
      starPositions[i + 1] = (Math.random() - 0.5) * 1200;
      starPositions[i + 2] = (Math.random() - 0.5) * 1200;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0x555566,
      size: 1.2,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Earth Sphere with high-contrast dark globe texture
    const textureLoader = new THREE.TextureLoader();
    // Use high-res Earth texture from reliable CDN
    const earthTexture = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      () => renderer.render(scene, camera)
    );
    const earthSpecular = textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'
    );

    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: earthSpecular,
      specular: new THREE.Color(0x112233),
      shininess: 15,
      color: new THREE.Color(0x1a2332), // Deep midnight ocean
      emissive: new THREE.Color(0x050810),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Glow Layer
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.025, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.06, 0.72, 0.51, 1.0) * intensity * 0.45;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(250, 120, 200);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.6);
    rimLight.position.set(-200, -100, -150);
    scene.add(rimLight);

    // 3. Geographical Markers Group
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);

    // Build Marker Meshes for visible locations
    const markerHitMeshes: THREE.Mesh[] = [];

    visibleMarkers.forEach(({ location, markerType, count }) => {
      const pos = latLongToVector3(location.latitude, location.longitude, earthRadius);

      const markerSubGroup = new THREE.Group();
      markerSubGroup.position.copy(pos);
      markerSubGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      const isExperienced = markerType === 'experienced';
      const color = isExperienced ? 0x10b981 : 0x8b5cf6; // Emerald for experienced, Violet for wishlist
      const emissive = isExperienced ? 0x059669 : 0x7c3aed;

      // Pin Needle Stem
      const stemHeight = 6;
      const stemGeo = new THREE.CylinderGeometry(0.3, 0.3, stemHeight, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color, opacity: 0.8, transparent: true });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = stemHeight / 2;
      markerSubGroup.add(stemMesh);

      // Pin Glowing Head Sphere
      const headRadius = isExperienced ? 2.5 : 2.2;
      const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.y = stemHeight + headRadius;
      headMesh.userData = { location, markerType, count };
      markerSubGroup.add(headMesh);
      markerHitMeshes.push(headMesh);

      // Outer Pulsing Glow Ring
      const ringGeo = new THREE.RingGeometry(headRadius * 1.3, headRadius * 1.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = stemHeight + headRadius;
      markerSubGroup.add(ringMesh);

      markersGroup.add(markerSubGroup);
    });

    // 4. Mouse / Touch Orbit Controls & Raycasting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0.2;
    let targetRotY = 0;
    let zoomDistance = 300;
    let targetZoomDistance = 300;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.x = x;
      mouse.y = y;
      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotY += deltaX * 0.005;
        targetRotX += deltaY * 0.005;
        // Clamp vertical rotation
        targetRotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotX));
      } else {
        // Hover Raycasting
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markerHitMeshes);
        if (intersects.length > 0) {
          const loc = intersects[0].object.userData?.location as Location;
          setHoveredLocation(loc);
          container.style.cursor = 'pointer';
        } else {
          setHoveredLocation(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };

    const onClick = (e: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markerHitMeshes);
      if (intersects.length > 0) {
        const loc = intersects[0].object.userData?.location as Location;
        if (loc) {
          // Camera fly-to animation target
          setFlyToTarget({
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude: 180,
          });
          setSelectedLocation(loc);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomDistance += e.deltaY * 0.25;
      targetZoomDistance = Math.max(140, Math.min(500, targetZoomDistance));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 5. Render Loop with Smooth Camera Transitions
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Idle Rotation when not dragging
      if (!isDragging && !flyToTarget) {
        targetRotY += 0.001;
      }

      // Smooth Rotation Damping
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;
      earthGroup.rotation.x = rotX;
      earthGroup.rotation.y = rotY;

      // Smooth Zoom Damping
      zoomDistance += (targetZoomDistance - zoomDistance) * 0.08;
      camera.position.z = zoomDistance;

      // Camera Fly-To Target Animation
      if (flyToTarget) {
        const targetPhi = (flyToTarget.latitude * Math.PI) / 180;
        const targetTheta = -(flyToTarget.longitude * Math.PI) / 180 - Math.PI / 2;

        targetRotX = targetPhi;
        targetRotY = targetTheta;
        targetZoomDistance = 210;

        // Reset target when close enough
        if (
          Math.abs(rotX - targetRotX) < 0.01 &&
          Math.abs(rotY - targetRotY) < 0.01
        ) {
          setFlyToTarget(null);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [visibleMarkers, flyToTarget]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Card */}
      {hoveredLocation && (
        <div
          className="fixed pointer-events-none z-40 bg-[#0e0e12]/95 border border-[#27272a] rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-14 transition-all duration-75"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 glow-emerald" />
            <p className="text-xs font-bold text-[#f5f5f0]">
              {hoveredLocation.name}
            </p>
          </div>
          <p className="text-[10px] text-[#71717a] mt-0.5">
            {[hoveredLocation.city, hoveredLocation.country].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Radial Vignette Mask */}
      <div className="pointer-events-none absolute inset-0 vignette-radial" />

      {/* Legend & Instructions */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0e0e12]/80 backdrop-blur-md border border-[#27272a] rounded-xl px-3 py-2 text-[11px] text-[#a1a1aa] flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 glow-emerald-subtle" />
          <span>Experienced</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 glow-violet-subtle" />
          <span>Wishlist</span>
        </div>
        <span className="text-[#3f3f46] hidden sm:inline">|</span>
        <span className="text-[#71717a] hidden sm:inline">
          Drag to rotate • Scroll to zoom • Click pin to explore
        </span>
      </div>
    </div>
  );
}
