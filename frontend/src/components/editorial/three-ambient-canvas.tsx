"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeAmbientCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Create 3D Luminous Particle Globe & Latitudes ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Core Particle Globe
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color("#72dc85"); // Emerald mint
    const color2 = new THREE.Color("#ffffff"); // Pure white
    const color3 = new THREE.Color("#38a454"); // Forest green

    const radius = 7.5;

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution for uniform sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradients
      const mixedColor = i % 3 === 0 ? color1 : i % 5 === 0 ? color3 : color2;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    globeGroup.add(particles);

    // 2. Delicate Orbital Rings (Latitudes)
    const ringMaterial = new THREE.LineBasicMaterial({
      color: 0x72dc85,
      transparent: true,
      opacity: 0.12,
    });

    const ringsCount = 4;
    for (let i = 0; i < ringsCount; i++) {
      const ringRadius = radius * (0.8 + i * 0.1);
      const ringGeom = new THREE.BufferGeometry();
      const points = [];
      for (let j = 0; j <= 64; j++) {
        const angle = (j / 64) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * ringRadius,
            (i - 1.5) * 1.8,
            Math.sin(angle) * ringRadius
          )
        );
      }
      ringGeom.setFromPoints(points);
      const ring = new THREE.Line(ringGeom, ringMaterial);
      globeGroup.add(ring);
    }

    // 3. Glowing Waypoint Flight Arcs
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);

    const createFlightArc = (v1: THREE.Vector3, v2: THREE.Vector3) => {
      const distance = v1.distanceTo(v2);
      const mid = v1.clone().lerp(v2, 0.5);
      const midLength = mid.length();
      mid.normalize().multiplyScalar(midLength + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(50);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xc3eeb4,
        transparent: true,
        opacity: 0.35,
      });
      return new THREE.Line(arcGeom, arcMat);
    };

    // Pre-create 6 distinct global luxury flight connections
    const waypoints = [
      new THREE.Vector3(5, 4, 3).normalize().multiplyScalar(radius),
      new THREE.Vector3(-4, 3, 5).normalize().multiplyScalar(radius),
      new THREE.Vector3(-2, -5, 4).normalize().multiplyScalar(radius),
      new THREE.Vector3(4, -4, 4).normalize().multiplyScalar(radius),
      new THREE.Vector3(0, 6, -3).normalize().multiplyScalar(radius),
    ];

    for (let i = 0; i < waypoints.length - 1; i++) {
      arcsGroup.add(createFlightArc(waypoints[i], waypoints[i + 1]));
    }

    // --- Interactive Mouse Parallax & Inertia ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) * 0.0004;
      mouseY = (event.clientY - windowHalfY) * 0.0004;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // --- Animation Loop ---
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth rotation
      globeGroup.rotation.y += 0.0018;
      globeGroup.rotation.x += 0.0004;

      // Mouse parallax easing
      targetRotationY += (mouseX - targetRotationY) * 0.05;
      targetRotationX += (mouseY - targetRotationX) * 0.05;

      globeGroup.rotation.y += targetRotationY * 0.2;
      globeGroup.rotation.x += targetRotationX * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-60"
      aria-hidden="true"
    />
  );
}
