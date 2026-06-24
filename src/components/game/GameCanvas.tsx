"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setGameState = useGameStore((state) => state.setGameState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    let animationFrameId: number;

    // Very basic placeholder loop for Phase 1
    const render = (time: number) => {
      // Clear canvas
      ctx.fillStyle = '#020617'; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw something simple
      ctx.fillStyle = '#4F46E5';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50 + Math.sin(time * 0.005) * 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Game Engine Initializing...', canvas.width / 2, canvas.height / 2 + 100);
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to return to menu', canvas.width / 2, canvas.height / 2 + 130);

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

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
      cancelAnimationFrame(animationFrameId);
    };
  }, [setGameState]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 block w-full h-full z-0"
    />
  );
}
