"use client"

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Globe component (must be used inside Canvas)
function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.5; // Rotate the globe
    }
  });

  return (
    <mesh
      ref={globeRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      scale={hovered ? [1.1, 1.1, 1.1] : [1, 1, 1]}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? 'lightblue' : 'blue'}
        map={new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1024px-Blue_Marble_2002.png')}
      />
    </mesh>
  );
}

// Main App component
export default function Home() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <Globe />
      </Canvas>
    </div>
  );
}