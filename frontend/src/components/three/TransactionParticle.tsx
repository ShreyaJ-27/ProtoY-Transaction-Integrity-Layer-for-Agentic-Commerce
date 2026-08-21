import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PIPELINE, type StageId } from '@/lib/constants';
import { getNodePosition } from './TransactionNetwork';

export interface TransactionParticleProps {
  activeStage: StageId | null;
  failed: boolean;
  success: boolean;
  autoPlay: boolean;
}

// The particle travels along the pipeline path: through each node in order.
export function TransactionParticle({ activeStage, failed, success, autoPlay }: TransactionParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const autoRef = useRef(0);

  const path = useMemo(() => {
    const pts = PIPELINE.map((_, i) => getNodePosition(i)).map(
      (p) => new THREE.Vector3(...p),
    );
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  }, []);

  const stageToProgress = useMemo(() => {
    const map: Record<string, number> = {};
    PIPELINE.forEach((s, i) => {
      map[s.id] = i / PIPELINE.length;
    });
    return map;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#65E6FF'),
        emissive: new THREE.Color('#65E6FF'),
        emissiveIntensity: 3.5,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

  const trailMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#65E6FF'),
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      }),
    [],
  );

  useFrame((_, dt) => {
    if (failed) {
      if (meshRef.current) {
        const p = path.getPointAt(Math.min(progressRef.current, 0.99));
        meshRef.current.position.copy(p);
      }
      mat.color.lerp(new THREE.Color('#FF5C70'), 0.1);
      mat.emissive.lerp(new THREE.Color('#FF5C70'), 0.1);
      trailMat.color.lerp(new THREE.Color('#FF5C70'), 0.1);
      return;
    }

    if (success) {
      mat.color.lerp(new THREE.Color('#36E0A0'), 0.1);
      mat.emissive.lerp(new THREE.Color('#36E0A0'), 0.1);
      trailMat.color.lerp(new THREE.Color('#36E0A0'), 0.1);
    } else if (activeStage) {
      const c = new THREE.Color(
        PIPELINE.find((s) => s.id === activeStage)?.color ?? '#65E6FF',
      );
      mat.color.lerp(c, 0.08);
      mat.emissive.lerp(c, 0.08);
      trailMat.color.lerp(c, 0.08);
    }

    if (activeStage) {
      targetRef.current = stageToProgress[activeStage] ?? 0;
    } else if (success) {
      targetRef.current = 1;
    }

    // Auto-play: continuously advance when idle
    if (autoPlay && !activeStage && !success && !failed) {
      autoRef.current += dt * 0.08;
      progressRef.current = autoRef.current % 1;
    } else {
      const diff = targetRef.current - progressRef.current;
      if (Math.abs(diff) > 0.5) {
        if (diff > 0) {
          progressRef.current += dt * 0.12;
        } else {
          progressRef.current -= dt * 0.12;
        }
      } else {
        progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetRef.current, 0.05);
      }
      progressRef.current = (progressRef.current + 1) % 1;
      autoRef.current = progressRef.current;
    }

    if (meshRef.current) {
      const p = path.getPointAt(progressRef.current % 0.999);
      meshRef.current.position.copy(p);
      const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.15;
      meshRef.current.scale.setScalar(pulse);
    }
    if (trailRef.current && meshRef.current) {
      trailRef.current.position.copy(meshRef.current.position);
      trailRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.004) * 0.2);
    }
  });

  return (
    <group>
      <mesh ref={trailRef} material={trailMat}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
      <mesh ref={meshRef} material={mat}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
    </group>
  );
}
