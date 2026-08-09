"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D EMN mark — a lens-beveled brand leaf with a dark seed sphere, lit and
 * gently parallaxing toward the pointer.
 *
 * Ported from the design system's `emn-logo-3d.js` custom element. The only
 * substantive change is loading `three` from the installed package rather than
 * a CDN `import()`, and driving lifecycle from a React effect instead of the
 * custom-element callbacks. Client-only (WebGL + requestAnimationFrame) — keep
 * behind a `"use client"` boundary like the globe component.
 */

// Fraction of the canvas's short side that the mark's bounding sphere fills.
// < 1 leaves a margin around the mark rather than bleeding it to the canvas edges.
const MARK_FILL = 0.7;

export default function EmnLogo3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let alive = true;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
    camera.position.set(0, 0, 330);

    // Leaf shape from EMN-leaf.svg path (y flipped for three's y-up).
    const s = new THREE.Shape();
    s.moveTo(54, -72);
    s.lineTo(54, -45);
    s.bezierCurveTo(54, -45, 54, 0, 99, 0);
    s.lineTo(126, 0);
    s.lineTo(126, -27);
    s.bezierCurveTo(126, -27, 126, -72, 81, -72);
    s.closePath();

    // Lens/lemon cross-section: tiny core depth, deep rounded bevel on both faces.
    let leafGeo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(s, {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 17,
      bevelSize: 16,
      bevelOffset: -16,
      bevelSegments: 24,
      curveSegments: 48,
    });

    // Weld duplicate vertices so normals smooth across the bevel seams.
    const weld = (geo: THREE.BufferGeometry, tol: number) => {
      const pos = geo.attributes.position;
      const prec = Math.round(1 / tol);
      const map = new Map<string, number>();
      const idx: number[] = [];
      const verts: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const k = `${Math.round(x * prec)}_${Math.round(y * prec)}_${Math.round(z * prec)}`;
        let j = map.get(k);
        if (j === undefined) {
          j = verts.length / 3;
          verts.push(x, y, z);
          map.set(k, j);
        }
        idx.push(j);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };
    leafGeo = weld(leafGeo, 0.05);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x6cbe45, roughness: 0.65, metalness: 0 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.85, metalness: 0 });
    const seed = new THREE.Mesh(new THREE.SphereGeometry(22.5, 48, 32), seedMat);
    seed.position.set(22.5, -85.5, 0);

    const group = new THREE.Group();
    group.add(leaf, seed);
    // Recenter the group on its bounding-box center so it spins about its middle.
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    leaf.position.sub(center);
    seed.position.sub(center);
    const radius = box.getSize(new THREE.Vector3()).length() / 2;
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0xf1f1f1, 0x3f8a46, 1.15));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-70, 90, 130);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x9ed46a, 0.45);
    fillLight.position.set(90, -50, 80);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(40, 60, -120);
    scene.add(rimLight);
    const spot = new THREE.SpotLight(0x9ed46a, 4.5, 900, Math.PI / 4.2, 0.9, 1.1);
    spot.position.set(0, 160, 220);
    spot.target = group;
    scene.add(spot);

    // Pointer parallax — ease the group's rotation toward a target driven by the
    // cursor's normalized position within the viewport.
    const base = { x: 0.16, y: -0.32 };
    const target = { x: base.x, y: base.y };
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      target.y = base.y + nx * 1.1;
      target.x = base.x + ny * 0.7;
    };
    window.addEventListener("pointermove", onMove);

    const resize = () => {
      const w = mount.clientWidth || 400;
      const h = mount.clientHeight || 340;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Dolly the camera so the mark fills the canvas on both axes. Divide by
      // MARK_FILL to pull the camera back a touch, leaving a margin around the mark.
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      camera.position.z = radius / Math.sin(Math.min(vFov, hFov) / 2) / MARK_FILL;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera); // repaint now — avoids a blank frame before the next RAF
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const tick = () => {
      if (!alive) return;
      group.rotation.x += (target.x - group.rotation.x) * 0.08;
      group.rotation.y += (target.y - group.rotation.y) * 0.08;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
