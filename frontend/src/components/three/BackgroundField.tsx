import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Subtle starfield / depth particles in the background.
export function BackgroundField({ count = 400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 12 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 0.05 + 0.01;
    }
    return { positions, sizes };
  }, [count]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color('#65E6FF'),
        size: 0.04,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.005;
    }
  });

  return (
    <points ref={ref} material={mat}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
    </points>
  );
}

// A faint technical grid plane below the scene for depth.
export function GridPlane() {
  const ref = useRef<THREE.GridHelper>(null);
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(40, 40, new THREE.Color('#65E6FF'), new THREE.Color('#1A2A33'));
    const m = g.material as THREE.Material | THREE.Material[];
    if (Array.isArray(m)) {
      m.forEach((mm) => {
        mm.transparent = true;
        mm.opacity = 0.08;
      });
    } else {
      m.transparent = true;
      m.opacity = 0.08;
    }
    return g;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.position.z = (ref.current.position.z + dt * 0.3) % 1;
  });

  return <primitive ref={ref} object={grid} position={[0, -3.5, 0]} />;
}
