'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { Group, MathUtils } from 'three';

interface BeanProps {
  position?: [number, number, number];
  onFinish?: () => void;
  finishPosition?: number;
  cameraAngle: number;
}

export function Bean({ position = [0, 2, 0], onFinish, finishPosition = 180, cameraAngle }: BeanProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const beanRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const walkCycle = useRef(0);
  const lastGrounded = useRef(0);
  const hasFinished = useRef(false);
  
  const moveSpeed = 12;
  const jumpForce = 14;

  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    const body = bodyRef.current;
    const currentVel = body.linvel();
    const pos = body.translation();
    
    (window as any).beanPosition = { x: pos.x, y: pos.y, z: pos.z };
    
    const isGrounded = Math.abs(currentVel.y) < 0.5;
    if (isGrounded) lastGrounded.current = state.clock.elapsedTime;
    const recentlyGrounded = state.clock.elapsedTime - lastGrounded.current < 0.15;

    const input = (window as any).gameKeys || { forward: false, backward: false, left: false, right: false, jump: false };

    let moveX = 0;
    let moveZ = 0;

    if (input.forward) moveZ -= 1;
    if (input.backward) moveZ += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 0) {
      moveX /= length;
      moveZ /= length;
    }

    const cos = Math.cos(cameraAngle);
    const sin = Math.sin(cameraAngle);
    const rotatedX = moveX * cos - moveZ * sin;
    const rotatedZ = moveX * sin + moveZ * cos;

    const targetVelX = rotatedX * moveSpeed;
    const targetVelZ = rotatedZ * moveSpeed;

    const controlFactor = recentlyGrounded ? 0.25 : 0.08;
    
    const newVelX = currentVel.x + (targetVelX - currentVel.x) * controlFactor;
    const newVelZ = currentVel.z + (targetVelZ - currentVel.z) * controlFactor;

    body.setLinvel({ x: newVelX, y: currentVel.y, z: newVelZ }, true);

    if (input.jump && recentlyGrounded && currentVel.y < 2) {
      body.setLinvel({ x: newVelX, y: jumpForce, z: newVelZ }, true);
    }

    const isMoving = Math.abs(rotatedX) > 0.1 || Math.abs(rotatedZ) > 0.1;
    
    if (beanRef.current) {
      if (isMoving) {
        const targetRotation = Math.atan2(rotatedX, rotatedZ);
        beanRef.current.rotation.y = MathUtils.lerp(beanRef.current.rotation.y, targetRotation, 0.15);
      }
      
      if (isMoving && recentlyGrounded) {
        walkCycle.current += delta * 14;
        const swing = Math.sin(walkCycle.current) * 0.8;
        
        if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -swing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = swing;
      } else {
        walkCycle.current = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.85;
        if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.85;
        if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.85;
        if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.85;
      }
    }

    if (pos.z < -finishPosition && onFinish && !hasFinished.current) {
      hasFinished.current = true;
      onFinish();
    }

    if (pos.y < -15) {
      body.setTranslation({ x: 0, y: 5, z: 8 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders={false}
      mass={1}
      linearDamping={1.5}
      angularDamping={1}
      enabledRotations={[false, false, false]}
      lockRotations
    >
      <CapsuleCollider args={[0.35, 0.35]} friction={1} restitution={0} />
      <group ref={beanRef}>
        {/* Body */}
        <mesh>
          <capsuleGeometry args={[0.35, 0.5, 4, 12]} />
          <meshStandardMaterial color="#14F195" />
        </mesh>
        
        {/* Face */}
        <mesh position={[0, 0.15, 0.28]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color="#5BFFC0" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.1, 0.22, 0.4]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-0.1, 0.22, 0.4]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshBasicMaterial color="white" />
        </mesh>
        
        {/* Pupils */}
        <mesh position={[0.1, 0.22, 0.46]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[-0.1, 0.22, 0.46]}>
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial color="#111" />
        </mesh>

        {/* Arms */}
        <group ref={leftArmRef} position={[-0.4, 0.1, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.3, 3, 6]} />
            <meshStandardMaterial color="#14F195" />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color="#5BFFC0" />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.4, 0.1, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.08, 0.3, 3, 6]} />
            <meshStandardMaterial color="#14F195" />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial color="#5BFFC0" />
          </mesh>
        </group>

        {/* Legs */}
        <group ref={leftLegRef} position={[-0.15, -0.5, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.1, 0.2, 3, 6]} />
            <meshStandardMaterial color="#14F195" />
          </mesh>
          <mesh position={[0, -0.35, 0.05]}>
            <boxGeometry args={[0.15, 0.1, 0.25]} />
            <meshStandardMaterial color="#0D9668" />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.15, -0.5, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.1, 0.2, 3, 6]} />
            <meshStandardMaterial color="#14F195" />
          </mesh>
          <mesh position={[0, -0.35, 0.05]}>
            <boxGeometry args={[0.15, 0.1, 0.25]} />
            <meshStandardMaterial color="#0D9668" />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}
