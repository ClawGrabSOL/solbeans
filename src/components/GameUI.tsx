'use client';

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';

interface GameUIProps {
  gameState: 'menu' | 'playing' | 'won';
  onStartGame: (username: string) => void;
  onRestart: () => void;
  elapsedTime: number;
  username: string;
}

// Simple wallet button placeholder
const WalletButton = () => (
  <button className="px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-xl font-semibold hover:opacity-90 transition-opacity">
    🔗 Connect Wallet
  </button>
);

export const GameUI: FC<GameUIProps> = ({ gameState, onStartGame, onRestart, elapsedTime, username }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [inputUsername, setInputUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    const adjectives = ['Swift', 'Bouncy', 'Lucky', 'Speedy', 'Brave', 'Cool', 'Epic', 'Mega', 'Super', 'Turbo'];
    const nouns = ['Bean', 'Runner', 'Jumper', 'Racer', 'Champion', 'Star', 'Hero', 'Legend', 'Master', 'Pro'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999);
    setInputUsername(`${randomAdj}${randomNoun}${randomNum}`);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (inputUsername.trim().length < 2) {
      setUsernameError('Username must be at least 2 characters');
      return;
    }
    if (inputUsername.trim().length > 16) {
      setUsernameError('Username must be 16 characters or less');
      return;
    }
    setUsernameError('');
    onStartGame(inputUsername.trim());
  };

  const handleClaim = async () => {
    setClaiming(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimed(true);
    setClaiming(false);
  };

  // Menu screen
  if (gameState === 'menu') {
    return (
      <div className="game-ui fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] via-[#2d1f5e] to-[#1a1a3e]">
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-md w-full">
          <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8 drop-shadow-2xl">
            <Image
              src="/solbeans-logo.png"
              alt="SOLBEANS"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="bg-gradient-to-r from-[#9945FF] to-[#14F195] p-1 rounded-2xl mb-10">
            <div className="bg-[#1a1a2e] rounded-xl px-10 py-5">
              <p className="text-gray-400 text-sm">🏆 Prize Pool</p>
              <p className="text-4xl font-bold text-[#14F195]">0.1 SOL</p>
            </div>
          </div>

          <div className="w-full mb-8">
            <div className="relative">
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => {
                  setInputUsername(e.target.value);
                  setUsernameError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
                placeholder="Enter username..."
                maxLength={16}
                className="w-full px-6 py-5 text-xl text-center font-bold bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors"
              />
              <button
                onClick={() => {
                  const adjectives = ['Swift', 'Bouncy', 'Lucky', 'Speedy', 'Brave', 'Cool', 'Epic', 'Mega', 'Super', 'Turbo'];
                  const nouns = ['Bean', 'Runner', 'Jumper', 'Racer', 'Champion', 'Star', 'Hero', 'Legend', 'Master', 'Pro'];
                  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
                  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
                  const randomNum = Math.floor(Math.random() * 999);
                  setInputUsername(`${randomAdj}${randomNoun}${randomNum}`);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors text-xl"
                title="Random name"
              >
                🎲
              </button>
            </div>
            {usernameError && (
              <p className="text-red-400 text-sm mt-2">{usernameError}</p>
            )}
          </div>

          <button
            onClick={handlePlay}
            className="w-full py-6 text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-2xl hover:scale-105 hover:shadow-lg hover:shadow-[#14F195]/30 transition-all active:scale-95 text-white shadow-xl mb-10"
          >
            ▶ PLAY
          </button>

          <div className="flex flex-col items-center gap-3 mb-8">
            <WalletButton />
            <p className="text-gray-500 text-sm">Connect to claim SOL rewards</p>
          </div>

          <div className="flex justify-center gap-10 text-gray-400 text-base">
            <span>🎮 WASD</span>
            <span>⬆️ Space</span>
            <span>🖱️ Mouse</span>
          </div>
        </div>
      </div>
    );
  }

  // In-game HUD
  if (gameState === 'playing') {
    return (
      <div className="game-ui">
        <div className="fixed top-4 left-0 right-0 flex justify-between items-start px-4">
          <div className="bg-black/70 backdrop-blur px-4 py-2 rounded-xl">
            <span className="text-[#14F195] font-bold">{username}</span>
          </div>

          <div className="flex gap-3 items-center">
            <div className="bg-black/70 backdrop-blur px-6 py-3 rounded-xl">
              <span className="text-3xl font-mono text-white">{formatTime(elapsedTime)}</span>
            </div>
            <div className="bg-black/70 backdrop-blur px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-gray-400 block">Prize</span>
              <span className="text-lg font-bold text-[#14F195]">0.1 SOL</span>
            </div>
          </div>

          <div>
            <WalletButton />
          </div>
        </div>

        <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-sm text-gray-400">
          WASD move • Space jump • ESC pause
        </div>
      </div>
    );
  }

  // Win screen
  if (gameState === 'won') {
    return (
      <div className="game-ui fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center space-y-6 p-8 bg-gradient-to-br from-[#1a1a2e] to-[#0E0E10] rounded-3xl border border-[#14F195]/30 max-w-md mx-4">
          <div className="text-7xl animate-bounce">🏆</div>
          
          <div>
            <p className="text-gray-400">Winner</p>
            <h2 className="text-3xl font-bold text-[#14F195]">{username}</h2>
          </div>

          <div className="bg-black/50 rounded-xl py-3 px-6 inline-block">
            <p className="text-gray-400 text-sm">Time</p>
            <p className="text-4xl font-mono text-white">{formatTime(elapsedTime)}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 rounded-xl border border-[#14F195]/30">
            <p className="text-gray-400 text-sm mb-1">You Won</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
              0.1 SOL
            </p>
          </div>

          {!claimed ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className={`w-full px-6 py-4 text-xl font-bold rounded-xl transition-all ${
                claiming 
                  ? 'bg-gray-600 cursor-wait' 
                  : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:scale-105'
              }`}
            >
              {claiming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Claiming...
                </span>
              ) : (
                '💰 CLAIM SOL'
              )}
            </button>
          ) : (
            <div className="p-4 bg-[#14F195]/20 rounded-xl border border-[#14F195]">
              <p className="text-[#14F195] font-bold">✓ 0.1 SOL sent to your wallet!</p>
            </div>
          )}

          <button
            onClick={() => {
              setClaimed(false);
              onRestart();
            }}
            className="w-full px-6 py-3 text-lg font-bold bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};
