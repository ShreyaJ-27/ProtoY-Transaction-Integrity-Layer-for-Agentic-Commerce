import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { IntegrityCore } from './IntegrityCore';
import { TransactionNetwork, getNodePosition } from './TransactionNetwork';
import { TransactionNode } from './TransactionNode';
import { TransactionParticle } from './TransactionParticle';
import { CameraRig } from './CameraRig';
import { BackgroundField, GridPlane } from './BackgroundField';
import { PIPELINE, type StageId } from '@/lib/constants';

export interface TransactionSceneProps {
  appState: string;
  activeStage: StageId | null;
  doneStages: StageId[];
  failed: boolean;
  success: boolean;
  pulseTrigger: number;
  hoveredStage: StageId | null;
  onHoverNode: (stage: StageId | null) => void;
  autoPlay: boolean;
}

export function TransactionScene({
  appState,
  activeStage,
  doneStages,
  failed,
  success,
  pulseTrigger,
  hoveredStage,
  onHoverNode,
  autoPlay,
}: TransactionSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 8.5], fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <fog attach="fog" args={['#05070A', 8, 24]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#65E6FF" distance={10} />
      <pointLight position={[4, 3, 4]} intensity={0.5} color="#9B8CFF" distance={12} />
      <pointLight position={[-4, -2, 3]} intensity={0.35} color="#65E6FF" distance={12} />
      <pointLight position={[0, 4, 2]} intensity={0.3} color="#9B8CFF" distance={14} />

      <CameraRig intensity={0.4} />

      <BackgroundField count={250} />
      <GridPlane />

      <IntegrityCore state={appState} pulseTrigger={pulseTrigger} />

      <TransactionNetwork
        activeStage={activeStage}
        doneStages={doneStages}
        failed={failed}
        success={success}
        hoveredStage={hoveredStage}
      />

      {PIPELINE.map((stage, i) => {
        const pos = getNodePosition(i);
        return (
          <TransactionNode
            key={stage.id}
            stage={stage}
            position={pos}
            active={activeStage === stage.id}
            done={doneStages.includes(stage.id)}
            failed={failed && activeStage === stage.id}
            success={success}
            hovered={hoveredStage === stage.id}
            onHover={onHoverNode}
          />
        );
      })}

      <TransactionParticle
        activeStage={activeStage}
        failed={failed}
        success={success}
        autoPlay={autoPlay}
      />
    </Canvas>
  );
}
