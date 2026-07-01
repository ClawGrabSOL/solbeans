'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Mesh, MeshStandardMaterial, Quaternion, Euler } from 'three';

// Simple platform - no shadows for perf
function Platform({ 
  position = [0, 0, 0] as [number, number, number], 
  size = [10, 0.5, 10] as [number, number, number], 
  color = '#444'
}: { 
  position?: [number, number, number]; 
  size?: [number, number, number]; 
  color?: string;
}) {
  return (
    <RigidBody type="fixed" position={position} friction={1} colliders="cuboid">
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}

// Rotating spinner with physics
function Spinner({ 
  position = [0, 1, 0] as [number, number, number],
  speed = 1,
  length = 8,
  color = '#FF4444'
}: { 
  position?: [number, number, number];
  speed?: number;
  length?: number;
  color?: string;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const rotationRef = useRef(0);
  const quaternion = useRef(new Quaternion());

  useFrame((_, delta) => {
    if (rigidBodyRef.current) {
      rotationRef.current += delta * speed;
      quaternion.current.setFromEuler(new Euler(0, rotationRef.current, 0));
      rigidBodyRef.current.setNextKinematicRotation(quaternion.current);
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={position} colliders="cuboid">
      <mesh>
        <boxGeometry args={[length, 0.6, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
    </RigidBody>
  );
}

// Moving platform
function MovingPlatform({ 
  position = [0, 0, 0] as [number, number, number],
  moveAxis = 'x' as 'x' | 'z',
  distance = 5,
  speed = 1,
  size = [4, 0.4, 4] as [number, number, number],
  color = '#9945FF'
}: { 
  position?: [number, number, number];
  moveAxis?: 'x' | 'z';
  distance?: number;
  speed?: number;
  size?: [number, number, number];
  color?: string;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const startPos = useRef([...position]);

  useFrame((state) => {
    if (rigidBodyRef.current) {
      const offset = Math.sin(state.clock.elapsedTime * speed) * distance;
      rigidBodyRef.current.setNextKinematicTranslation({
        x: moveAxis === 'x' ? startPos.current[0] + offset : startPos.current[0],
        y: startPos.current[1],
        z: moveAxis === 'z' ? startPos.current[2] + offset : startPos.current[2]
      });
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={position} colliders="cuboid">
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
    </RigidBody>
  );
}

// Swinging hammer
function Hammer({ 
  position = [0, 5, 0] as [number, number, number],
  speed = 2,
  armLength = 4
}: { 
  position?: [number, number, number];
  speed?: number;
  armLength?: number;
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const quaternion = useRef(new Quaternion());

  useFrame((state) => {
    if (rigidBodyRef.current) {
      const angle = Math.sin(state.clock.elapsedTime * speed) * 1.2;
      quaternion.current.setFromEuler(new Euler(0, 0, angle));
      rigidBodyRef.current.setNextKinematicRotation(quaternion.current);
    }
  });

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders="ball">
        <mesh position={[0, -armLength/2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, armLength, 6]} />
          <meshStandardMaterial color="#666" />
        </mesh>
        <mesh position={[0, -armLength, 0]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#FF4444" roughness={0.3} metalness={0.5} />
        </mesh>
      </RigidBody>
    </group>
  );
}

// Pusher wall
function Pusher({
  position = [0, 0, 0] as [number, number, number],
  speed = 0.8,
  distance = 4,
  axis = 'x' as 'x' | 'z'
}: {
  position?: [number, number, number];
  speed?: number;
  distance?: number;
  axis?: 'x' | 'z';
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const startPos = useRef([...position]);

  useFrame((state) => {
    if (rigidBodyRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * speed) + 1) / 2 * distance;
      rigidBodyRef.current.setNextKinematicTranslation({
        x: axis === 'x' ? startPos.current[0] + t : startPos.current[0],
        y: startPos.current[1],
        z: axis === 'z' ? startPos.current[2] + t : startPos.current[2]
      });
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={position} colliders="cuboid">
      <mesh>
        <boxGeometry args={[1.5, 2.5, 5]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.4} />
      </mesh>
    </RigidBody>
  );
}

// Bounce pad
function BouncePad({ position = [0, 0, 0] as [number, number, number] }: { position?: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} restitution={3} friction={0.5} colliders="cuboid">
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.3, 12]} />
        <meshStandardMaterial color="#14F195" emissive="#14F195" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.4, 0.6, 6]} />
        <meshStandardMaterial color="#fff" emissive="#14F195" emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  );
}

// Finish line
function FinishLine({ position = [0, 0.1, -100] as [number, number, number] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" friction={1} colliders="cuboid">
        <mesh>
          <boxGeometry args={[14, 0.3, 10]} />
          <meshStandardMaterial color="#14F195" emissive="#14F195" emissiveIntensity={0.6} />
        </mesh>
      </RigidBody>
      
      {/* Arch */}
      <mesh position={[-6, 3, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 6, 8]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[6, 3, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 6, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0, 6.5, 0]}>
        <boxGeometry args={[12, 1.5, 0.3]} />
        <meshStandardMaterial color="#9945FF" emissive="#9945FF" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Side walls
function Walls() {
  return (
    <>
      <RigidBody type="fixed" position={[-15, 2, -90]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[0.5, 10, 250]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[15, 2, -90]} colliders="cuboid">
        <mesh visible={false}>
          <boxGeometry args={[0.5, 10, 250]} />
        </mesh>
      </RigidBody>
    </>
  );
}

export function Level() {
  return (
    <group>
      {/* ============ START ZONE ============ */}
      <Platform position={[0, 0, 5]} size={[16, 0.5, 14]} color="#4A90D9" />
      <BouncePad position={[0, 0.2, 0]} />
      
      {/* ============ SECTION 1: Platform Hopping ============ */}
      <Platform position={[0, 0, -8]} size={[10, 0.5, 8]} color="#5BA55B" />
      <Platform position={[-4, 0.8, -18]} size={[6, 0.5, 5]} color="#5BA55B" />
      <Platform position={[4, 1.5, -26]} size={[6, 0.5, 5]} color="#5BA55B" />
      <Platform position={[0, 2, -35]} size={[8, 0.5, 6]} color="#5BA55B" />
      
      {/* ============ SECTION 2: Spinner Alley ============ */}
      <Platform position={[0, 0, -50]} size={[18, 0.5, 22]} color="#D9A54A" />
      <Spinner position={[0, 1.5, -43]} speed={2} length={14} />
      <Spinner position={[0, 1.5, -50]} speed={-2.5} length={14} />
      <Spinner position={[0, 1.5, -57]} speed={1.8} length={14} />
      <BouncePad position={[-7, 0.2, -50]} />
      
      {/* ============ SECTION 3: Moving Platforms ============ */}
      <MovingPlatform position={[-4, 1, -70]} moveAxis="x" distance={6} speed={1.2} size={[5, 0.4, 5]} />
      <MovingPlatform position={[4, 1.5, -80]} moveAxis="x" distance={6} speed={1} size={[5, 0.4, 5]} color="#14F195" />
      <MovingPlatform position={[0, 2, -90]} moveAxis="x" distance={5} speed={1.5} size={[5, 0.4, 5]} />
      
      {/* ============ SECTION 4: Hammer Zone ============ */}
      <Platform position={[0, 0, -108]} size={[20, 0.5, 26]} color="#D94A4A" />
      <Hammer position={[-6, 8, -100]} speed={2.2} armLength={6} />
      <Hammer position={[6, 8, -108]} speed={2} armLength={6} />
      <Hammer position={[0, 8, -116]} speed={2.5} armLength={6} />
      
      {/* ============ SECTION 5: Pusher Gauntlet ============ */}
      <Platform position={[0, 0, -135]} size={[12, 0.5, 18]} color="#9945FF" />
      <Pusher position={[-6, 1.2, -130]} speed={1.2} distance={8} axis="x" />
      <Pusher position={[6, 1.2, -138]} speed={1} distance={-8} axis="x" />
      
      {/* ============ SECTION 6: Double Spinner ============ */}
      <Platform position={[0, 0, -158]} size={[16, 0.5, 14]} color="#FF6B35" />
      <Spinner position={[0, 1.2, -154]} speed={3} length={12} color="#FF4444" />
      <Spinner position={[0, 2.8, -162]} speed={-2.5} length={12} color="#FF4444" />
      
      {/* ============ SECTION 7: Final Platforms ============ */}
      <MovingPlatform position={[0, 2, -175]} moveAxis="z" distance={3} speed={1.5} size={[6, 0.4, 6]} color="#14F195" />
      
      {/* ============ FINISH LINE ============ */}
      <FinishLine position={[0, 0.1, -195]} />
      
      {/* Side walls */}
      <Walls />
      
      {/* Ground - simple flat color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -90]}>
        <planeGeometry args={[100, 400]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>
    </group>
  );
}
