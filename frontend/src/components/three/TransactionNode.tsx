import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { NODE_DESCRIPTIONS, type StageDef, type StageId } from '@/lib/constants';

export interface TransactionNodeProps {
  stage: StageDef;
  position: [number, number, number];
  active: boolean;
  done: boolean;
  failed: boolean;
  success: boolean;
  hovered: boolean;
  onHover: (stage: StageId | null) => void;
}

export function TransactionNode({
  stage,
  position,
  active,
  done,
  failed,
  success,
  hovered,
  onHover,
}: TransactionNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);

  const baseColor = useMemo(() => new THREE.Color(stage.color), [stage.color]);
  const failColor = useMemo(() => new THREE.Color('#FF5C70'), []);
  const successColor = useMemo(() => new THREE.Color('#36E0A0'), []);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: baseColor.clone().multiplyScalar(0.35),
        emissive: baseColor.clone().multiplyScalar(0.3),
        emissiveIntensity: 0.4,
        roughness: 0.25,
        metalness: 0.6,
        transparent: true,
        opacity: 0.9,
      }),
    [baseColor],
  );

  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.0,
        side: THREE.BackSide,
      }),
    [baseColor],
  );

  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.0,
      }),
    [baseColor],
  );

  useFrame((_, dt) => {
    const t = performance.now() * 0.001;

    let targetEmissive = 0.4;
    let targetHalo = 0.0;
    let targetRing = 0.0;
    let targetScale = 1;
    let colorRef = baseColor;

    if (failed) {
      colorRef = failColor;
      targetEmissive = 1.8;
      targetHalo = 0.22;
      targetScale = 1 + Math.sin(t * 6) * 0.04;
    } else if (success && (stage.id === 'algorand' || stage.id === 'memory' || stage.id === 'outcome')) {
      colorRef = successColor;
      targetEmissive = 2.2;
      targetHalo = 0.2;
      targetRing = 0.5;
      targetScale = 1.1;
    } else if (active) {
      targetEmissive = 2.0;
      targetHalo = 0.2;
      targetRing = 0.45;
      targetScale = 1.15;
    } else if (hovered || localHover) {
      targetEmissive = 1.4;
      targetHalo = 0.15;
      targetRing = 0.3;
      targetScale = 1.08;
    } else if (done) {
      targetEmissive = 1.0;
      targetHalo = 0.08;
    }

    mat.color.lerp(colorRef.clone().multiplyScalar(0.35), 0.08);
    mat.emissive.lerp(colorRef.clone().multiplyScalar(0.3), 0.08);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.1);

    haloMat.color.lerp(colorRef, 0.08);
    haloMat.opacity = THREE.MathUtils.lerp(haloMat.opacity, targetHalo, 0.1);

    ringMat.color.lerp(colorRef, 0.08);
    ringMat.opacity = THREE.MathUtils.lerp(ringMat.opacity, targetRing, 0.1);

    if (meshRef.current) {
      const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.12);
      meshRef.current.scale.setScalar(s);
      meshRef.current.rotation.y += dt * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.5;
      if (active || failed || hovered || localHover || (success && targetRing > 0)) {
        const rs = 1 + Math.sin(t * 3) * 0.05;
        ringRef.current.scale.setScalar(rs);
      } else {
        ringRef.current.scale.setScalar(1);
      }
    }
  });

  const showTooltip = hovered || localHover;

  return (
    <group position={position}>
      {/* Invisible larger hit area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setLocalHover(true);
          onHover(stage.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setLocalHover(false);
          onHover(null);
        }}
        visible={false}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
      </mesh>

      {/* Node sphere */}
      <mesh ref={meshRef} material={mat}>
        <icosahedronGeometry args={[0.14, 1]} />
      </mesh>

      {/* Halo */}
      <mesh ref={haloRef} material={haloMat}>
        <sphereGeometry args={[0.26, 24, 24]} />
      </mesh>

      {/* Activation ring */}
      <mesh ref={ringRef} material={ringMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.004, 8, 64]} />
      </mesh>

      {/* Tooltip */}
      {showTooltip && (
        <Html center distanceFactor={8} position={[0, 0.35, 0]} zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none whitespace-nowrap">
            <div className="glass-strong rounded-lg px-2.5 py-1.5 border border-white/10">
              <div
                className="text-[10px] font-mono font-medium tracking-[0.15em] uppercase"
                style={{ color: stage.color }}
              >
                {stage.label}
              </div>
              <div className="text-[8px] font-mono text-muted tracking-wider mt-0.5">
                {NODE_DESCRIPTIONS[stage.id]}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
