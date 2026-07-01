'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameUI } from '@/components/GameUI';

const Game = dynamic(() => import('@/components/Game').then(mod => mod.Game), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-[#1a1a3e]">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 border-4 border-[#14F195] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#14F195] text-2xl font-bold">Loading SOLBEANS...</p>
      </div>
    </div>
  ),
});

type GameState = 'menu' | 'playing' | 'won';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [username, setUsername] = useState('');
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      
      const updateTimer = () => {
        if (startTimeRef.current) {
          setElapsedTime(Date.now() - startTimeRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTimer);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameState]);

  const handleStartGame = useCallback((name: string) => {
    setUsername(name);
    setElapsedTime(0);
    setGameState('playing');
  }, []);

  const handleWin = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setGameState('won');
  }, []);

  const handleRestart = useCallback(() => {
    setElapsedTime(0);
    setGameState('menu');
  }, []);

  return (
    <main className="w-full h-screen relative overflow-hidden">
      <Game 
        onWin={handleWin} 
        gameState={gameState}
      />
      <GameUI 
        gameState={gameState}
        onStartGame={handleStartGame}
        onRestart={handleRestart}
        elapsedTime={elapsedTime}
        username={username}
      />
    </main>
  );
}
