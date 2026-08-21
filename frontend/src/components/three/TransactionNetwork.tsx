import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PIPELINE, type StageId } from '@/lib/constants';

export interface TransactionNetworkProps {
  activeStage: StageId | null;
  doneStages: StageId[];
  failed: boolean;
  success: boolean;
  hoveredStage: StageId | null;
}

// Place nodes in a 3D arrangement: upper ring for analysis stages, lower ring for execution stages
export function getNodePosition(index: number): [number, number, number] {
  // First 4 nodes (groq, intent, risk, economics) in upper hemisphere
  // Last 5 nodes (provider, x402, algorand, outcome, memory) in lower hemisphere
  if (index < 4) {
    const angle = (index / 4) * Math.PI - Math.PI / 2;
    const radius = 3.0;
    return [Math.cos(angle) * radius, 1.2 + Math.sin(index * 0.7) * 0.3, Math.sin(angle) * radius];
  }
  const lowerIndex = index - 4;
  const angle = (lowerIndex / 5) * Math.PI - Math.PI / 2;
  const radius = 3.0;
  return [Math.cos(angle) * radius, -1.2 - Math.sin(lowerIndex * 0.5) * 0.3, Math.sin(angle) * radius];
}

export function TransactionNetwork({
  activeStage,
  doneStages,
  failed,
  success,
  hoveredStage,
}: TransactionNetworkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => PIPELINE, []);

  // Build connection curves: each node connects to the core, and sequential nodes connect to each other
  const coreCurves = useMemo(() => {
    return nodes.map((_, i) => {
      const pos = getNodePosition(i);
      const start = new THREE.Vector3(...pos);
      const end = new THREE.Vector3(0, 0, 0);
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2 + (start.y > 0 ? -0.3 : 0.3),
        (start.z + end.z) / 2,
      );
      return new THREE.CatmullRomCurve3([start, mid, end]);
    });
  }, [nodes]);

  // Sequential pipeline connections
  const pipelineCurves = useMemo(() => {
    const result: THREE.CatmullRomCurve3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const a = getNodePosition(i);
      const b = getNodePosition((i + 1) % nodes.length);
      const mid = new THREE.Vector3(
        (a[0] + b[0]) / 2 * 0.5,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2 * 0.5,
      );
      result.push(new THREE.CatmullRomCurve3([new THREE.Vector3(...a), mid, new THREE.Vector3(...b)]));
    }
    return result;
  }, [nodes]);

  // Animated energy flow positions along pipeline curves
  const flowRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.02;
    }
    // Animate energy flow particles along pipeline curves
    const t = performance.now() * 0.001;
    flowRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const curve = pipelineCurves[i];
      if (!curve) return;
      const progress = (t * 0.15 + i * 0.1) % 1;
      const p = curve.getPointAt(progress);
      mesh.position.copy(p);
      const isActive = activeStage === nodes[i].id || activeStage === nodes[(i + 1) % nodes.length].id;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 0.8 : 0.3, 0.1);
    });
  });

  return (
    <group ref={groupRef}>
      {/* Core connection lines */}
      {coreCurves.map((curve, i) => {
        const points = curve.getPoints(32);
        const positions = new Float32Array(points.length * 3);
        points.forEach((p, j) => {
          positions[j * 3] = p.x;
          positions[j * 3 + 1] = p.y;
          positions[j * 3 + 2] = p.z;
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const isActive = activeStage === nodes[i].id;
        const isHovered = hoveredStage === nodes[i].id;
        const isDone = doneStages.includes(nodes[i].id);
        const color = failed
          ? '#FF5C70'
          : success
            ? '#36E0A0'
            : isActive || isHovered
              ? nodes[i].color
              : isDone
                ? nodes[i].color
                : '#1A2832';
        return (
          <primitive
            key={`core-line-${i}`}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color,
                  transparent: true,
                  opacity: isActive || isHovered ? 0.5 : isDone ? 0.25 : 0.1,
                }),
              )
            }
          />
        );
      })}

      {/* Pipeline connection lines */}
      {pipelineCurves.map((curve, i) => {
        const points = curve.getPoints(48);
        const positions = new Float32Array(points.length * 3);
        points.forEach((p, j) => {
          positions[j * 3] = p.x;
          positions[j * 3 + 1] = p.y;
          positions[j * 3 + 2] = p.z;
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const isActive = activeStage === nodes[i].id;
        const color = failed
          ? '#FF5C70'
          : success
            ? '#36E0A0'
            : isActive
              ? nodes[i].color
              : '#1A2832';
        return (
          <primitive
            key={`pipe-line-${i}`}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color,
                  transparent: true,
                  opacity: isActive ? 0.6 : 0.12,
                }),
              )
            }
          />
        );
      })}

      {/* Energy flow particles */}
      {pipelineCurves.map((_, i) => (
        <mesh
          key={`flow-${i}`}
          ref={(m) => {
            if (m) flowRefs.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial
            color={nodes[i].color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
