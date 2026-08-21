import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  // 0..1 parallax intensity
  intensity?: number;
}

// Cinematic camera with subtle mouse-based parallax. Camera stays fixed on the core.
export function CameraRig({ intensity = 0.6 }: CameraRigProps) {
  const { camera, pointer } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame((_, dt) => {
    // pointer is normalized -1..1
    targetX.current = pointer.x * 0.8 * intensity;
    targetY.current = pointer.y * 0.4 * intensity;

    const baseZ = 8.5;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX.current, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.6 + targetY.current, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.04);
    camera.lookAt(0, 0, 0);

    // Slight roll for cinematic feel
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetX.current * -0.02, 0.04);

    void dt;
  });

  return null;
}
