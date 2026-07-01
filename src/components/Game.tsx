'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Bean } from './Bean';
import { Level } from './Level';
import { Vector3, MathUtils } from 'three';

// Third-person camera with mouse control
function ThirdPersonCamera({ cameraAngle, cameraVertical }: { cameraAngle: number; cameraVertical: number }) {
  const { camera } = useThree();
  const smoothedPosition = useRef(new Vector3(0, 5, 10));
  const initialized = useRef(false);
  
  useFrame(() => {
    const beanPos = (window as any).beanPosition;
    if (!beanPos) return;

    const distance = 8;
    const height = 3 + cameraVertical * 4;
    
    const targetX = beanPos.x + Math.sin(cameraAngle) * distance;
    const targetY = beanPos.y + height;
    const targetZ = beanPos.z + Math.cos(cameraAngle) * distance;

    if (!initialized.current) {
      smoothedPosition.current.set(targetX, targetY, targetZ);
      initialized.current = true;
    }

    smoothedPosition.current.x = MathUtils.lerp(smoothedPosition.current.x, targetX, 0.1);
    smoothedPosition.current.y = MathUtils.lerp(smoothedPosition.current.y, targetY, 0.1);
    smoothedPosition.current.z = MathUtils.lerp(smoothedPosition.current.z, targetZ, 0.1);

    camera.position.copy(smoothedPosition.current);
    camera.lookAt(beanPos.x, beanPos.y + 0.5, beanPos.z);
  });

  return null;
}

// Game scene component - OPTIMIZED
function GameScene({ onFinish, cameraAngle, cameraVertical }: { onFinish: () => void; cameraAngle: number; cameraVertical: number }) {
  return (
    <>
      <ThirdPersonCamera cameraAngle={cameraAngle} cameraVertical={cameraVertical} />
      
      {/* Simple lighting - NO SHADOWS for performance */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[30, 50, 20]} intensity={0.8} />
      <hemisphereLight args={['#87CEEB', '#444', 0.6]} />
      
      {/* Simple sky color */}
      <color attach="background" args={['#1a1a3e']} />
      
      {/* Physics world - optimized */}
      <Physics gravity={[0, -30, 0]} timeStep={1/60}>
        <Bean 
          position={[0, 3, 8]} 
          onFinish={onFinish} 
          finishPosition={180}
          cameraAngle={cameraAngle}
        />
        <Level />
      </Physics>
    </>
  );
}

interface GameProps {
  onWin: () => void;
  gameState: 'menu' | 'playing' | 'won';
}

export function Game({ onWin, gameState }: GameProps) {
  const [cameraAngle, setCameraAngle] = useState(0);
  const [cameraVertical, setCameraVertical] = useState(0.3);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState !== 'playing') {
      (window as any).gameKeys = { forward: false, backward: false, left: false, right: false, jump: false };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      setIsPointerLocked(false);
      return;
    }

    const handleClick = () => {
      if (canvasRef.current && document.pointerLockElement !== canvasRef.current) {
        canvasRef.current.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current;
      setIsPointerLocked(locked);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current) {
        setCameraAngle(prev => prev - e.movementX * 0.003);
        setCameraVertical(prev => MathUtils.clamp(prev - e.movementY * 0.002, -0.5, 0.8));
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    
    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas?.removeEventListener('click', handleClick);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') {
      (window as any).gameKeys = { forward: false, backward: false, left: false, right: false, jump: false };
      return;
    }

    const keys = { forward: false, backward: false, left: false, right: false, jump: false };
    (window as any).gameKeys = keys;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = true;
          break;
        case 'Space':
          keys.jump = true;
          e.preventDefault();
          break;
        case 'Escape':
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          break;
      }
      (window as any).gameKeys = { ...keys };
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.right = false;
          break;
        case 'Space':
          keys.jump = false;
          break;
      }
      (window as any).gameKeys = { ...keys };
    };

    const handleBlur = () => {
      keys.forward = false;
      keys.backward = false;
      keys.left = false;
      keys.right = false;
      keys.jump = false;
      (window as any).gameKeys = { ...keys };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      (window as any).gameKeys = { forward: false, backward: false, left: false, right: false, jump: false };
    };
  }, [gameState]);

  const handleFinish = useCallback(() => {
    onWin();
  }, [onWin]);

  return (
    <div ref={canvasRef} className="w-full h-full">
      {gameState === 'playing' && !isPointerLocked && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-50 cursor-pointer"
          onClick={() => canvasRef.current?.requestPointerLock()}
        >
          <div className="bg-black/80 px-6 py-4 rounded-xl text-center">
            <p className="text-white text-lg">Click anywhere to play</p>
            <p className="text-gray-400 text-sm mt-1">ESC to pause</p>
          </div>
        </div>
      )}
      <Canvas 
        camera={{ fov: 70, near: 0.1, far: 250 }} 
        dpr={1}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {gameState === 'playing' && (
            <GameScene 
              onFinish={handleFinish} 
              cameraAngle={cameraAngle}
              cameraVertical={cameraVertical}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
