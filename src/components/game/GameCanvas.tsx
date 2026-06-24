"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { GameLoop } from '@/game/engine/GameLoop';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const setGameState = useGameStore((state) => state.setGameState);
  const gameState = useGameStore((state) => state.gameState);
  const health = useGameStore((state) => state.stats.health);
  const prevHealth = useRef(health);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize Game Loop only once
    if (!gameLoopRef.current) {
      gameLoopRef.current = new GameLoop(canvas);
    }

    const handleResize = () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Temp logic to exit game
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState('MENU');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
        gameLoopRef.current = null;
      }
    };
  }, [setGameState]);

  // Handle play/pause state changes
  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current?.start();
    } else {
      gameLoopRef.current?.stop();
    }
  }, [gameState]);

  // Handle respawn reset
  useEffect(() => {
    if (prevHealth.current <= 0 && health > 0) {
      gameLoopRef.current?.reset();
    }
    prevHealth.current = health;
  }, [health]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 block w-full h-full z-0"
    />
  );
}
