import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface IntegrityCoreProps {
  state: string;
  pulseTrigger?: number;
}

const STATE_COLOR: Record<string, string> = {
  IDLE: '#65E6FF',
  ANALYZING: '#9B8CFF',
  RISK: '#FFB547',
  ECONOMICS: '#65E6FF',
  PROVIDER: '#9B8CFF',
  PAYMENT: '#FFB547',
  SETTLEMENT: '#36E0A0',
  OUTCOME: '#65E6FF',
  MEMORY: '#9B8CFF',
  SUCCESS: '#36E0A0',
  FAILED: '#FF5C70',
  PAYMENT_REQUIRED: '#FFB547',
};

const FRAGMENT_COUNT = 8;
const PARTICLE_COUNT = 40;

export function IntegrityCore({ state, pulseTrigger = 0 }: IntegrityCoreProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const fragmentsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const pulseRef = useRef(0);
  const lastPulse = useRef(pulseTrigger);

  const color = STATE_COLOR[state] ?? '#65E6FF';
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  const outerMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#0B1118'),
        roughness: 0.08,
        metalness: 0.7,
        transmission: 0.7,
        thickness: 1.4,
        ior: 1.45,
        transparent: true,
        opacity: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.9,
      }),
    [],
  );

  const graphiteMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A1016'),
        roughness: 0.35,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85,
      }),
    [],
  );

  const innerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colorObj,
        emissive: colorObj,
        emissiveIntensity: 1.6,
        transparent: true,
        opacity: 0.92,
        roughness: 0.25,
        metalness: 0.1,
      }),
    [colorObj],
  );

  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colorObj,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
      }),
    [colorObj],
  );

  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colorObj,
        emissive: colorObj,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.55,
        roughness: 0.3,
        metalness: 0.4,
      }),
    [colorObj],
  );

  const particleMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: colorObj,
        size: 0.025,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [colorObj],
  );

  const fragmentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colorObj,
        emissive: colorObj,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.4,
        roughness: 0.5,
        metalness: 0.6,
      }),
    [colorObj],
  );

  // Particle positions orbiting the core
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.6;
      const y = (Math.random() - 0.5) * 1.2;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  // Fragment transforms
  const fragmentData = useMemo(() => {
    return Array.from({ length: FRAGMENT_COUNT }, (_, i) => {
      const angle = (i / FRAGMENT_COUNT) * Math.PI * 2;
      const r = 1.6 + Math.random() * 0.3;
      return {
        position: [Math.cos(angle) * r, (Math.random() - 0.5) * 0.8, Math.sin(angle) * r] as [
          number,
          number,
          number,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
          number,
          number,
          number,
        ],
        scale: 0.04 + Math.random() * 0.06,
        speed: 0.3 + Math.random() * 0.4,
      };
    });
  }, []);

  useFrame((_, dt) => {
    const t = performance.now() * 0.001;

    if (outerRef.current) outerRef.current.rotation.y += dt * 0.06;
    if (innerRef.current) {
      innerRef.current.rotation.y -= dt * 0.2;
      innerRef.current.rotation.x = Math.sin(t * 0.4) * 0.12;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.08;
      ring1Ref.current.rotation.z += dt * 0.14;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2.5;
      ring2Ref.current.rotation.y += dt * 0.18;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = Math.PI / 1.8;
      ring3Ref.current.rotation.z -= dt * 0.11;
    }

    // Particles orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y += dt * 0.15;
      particlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }

    // Fragments float
    if (fragmentsRef.current) {
      fragmentsRef.current.children.forEach((child, i) => {
        const data = fragmentData[i];
        if (!data) return;
        child.rotation.x += dt * data.speed * 0.5;
        child.rotation.y += dt * data.speed * 0.3;
        child.position.y = data.position[1] + Math.sin(t * data.speed + i) * 0.15;
      });
    }

    // Pulse handling
    if (pulseTrigger !== lastPulse.current) {
      lastPulse.current = pulseTrigger;
      pulseRef.current = 1;
    }
    if (pulseRef.current > 0) {
      pulseRef.current = Math.max(0, pulseRef.current - dt * 1.0);
      const p = pulseRef.current;
      const scale = 1 + p * 0.1;
      if (innerRef.current) innerRef.current.scale.setScalar(scale);
      if (glowRef.current) {
        glowRef.current.scale.setScalar(1 + p * 0.35);
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + p * 0.15;
      }
      innerMat.emissiveIntensity = 1.6 + p * 2.5;
    } else {
      if (innerRef.current) innerRef.current.scale.setScalar(1);
      if (glowRef.current) {
        glowRef.current.scale.setScalar(1);
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05;
      }
      const breath = 1.6 + Math.sin(t * 0.7) * 0.12;
      innerMat.emissiveIntensity = breath;
    }
  });

  return (
    <group>
      {/* Outer transparent glass sphere */}
      <mesh ref={outerRef} material={outerMat}>
        <sphereGeometry args={[1.5, 64, 64]} />
      </mesh>

      {/* Dark graphite inner sphere */}
      <mesh material={graphiteMat}>
        <sphereGeometry args={[1.1, 48, 48]} />
      </mesh>

      {/* Soft outer glow */}
      <mesh ref={glowRef} material={glowMat}>
        <sphereGeometry args={[1.95, 32, 32]} />
      </mesh>

      {/* Inner luminous core */}
      <mesh ref={innerRef} material={innerMat}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>

      {/* Three thin orbital rings */}
      <mesh ref={ring1Ref} material={ringMat}>
        <torusGeometry args={[1.15, 0.006, 16, 128]} />
      </mesh>
      <mesh ref={ring2Ref} material={ringMat}>
        <torusGeometry args={[1.3, 0.005, 16, 128]} />
      </mesh>
      <mesh ref={ring3Ref} material={ringMat}>
        <torusGeometry args={[1.45, 0.004, 16, 128]} />
      </mesh>

      {/* Orbiting data particles */}
      <points ref={particlesRef} material={particleMat}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
      </points>

      {/* Floating geometric fragments */}
      <group ref={fragmentsRef}>
        {fragmentData.map((f, i) => (
          <mesh
            key={i}
            material={fragmentMat}
            position={f.position}
            rotation={f.rotation}
            scale={f.scale}
          >
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
