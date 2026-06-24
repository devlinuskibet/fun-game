"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { RotateCcw, Home } from 'lucide-react';

export default function GameOver() {
  const setGameState = useGameStore((state) => state.setGameState);
  const updateStats = useGameStore((state) => state.updateStats);
  const inventory = useGameStore((state) => state.inventory);

  const handleRestart = () => {
    // Reset stats
    updateStats({
      health: 100,
      shield: 100,
      energy: 100,
      fuel: 100,
    });
    // For a real game, you might want to reset inventory and reload the game engine.
    // Setting state back to MENU is the easiest way to re-mount GameCanvas.
    setGameState('MENU');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-xl flex flex-col items-center max-w-md w-full text-center"
      >
        <h2 className="text-4xl font-bold text-danger mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
          HULL BREACH DETECTED
        </h2>
        <p className="text-lg text-white/80 font-mono mb-8">Ship Destroyed</p>

        <div className="w-full bg-black/30 rounded p-4 mb-8">
          <h3 className="text-sm text-white/50 font-bold tracking-widest mb-2 border-b border-white/10 pb-1">
            SALVAGED BEFORE DESTRUCTION
          </h3>
          <div className="flex justify-between text-white/90 font-mono mb-1">
            <span>Credits:</span>
            <span className="text-accent">{inventory.credits}</span>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button
            onClick={handleRestart}
            className="flex-1 glass-button flex items-center justify-center gap-2 py-3 rounded text-white hover:bg-white/10 transition-colors font-semibold"
          >
            <RotateCcw size={18} />
            RESPAWN
          </button>
          
          <button
            onClick={() => setGameState('MENU')}
            className="flex-1 glass-panel flex items-center justify-center gap-2 py-3 rounded text-white/70 hover:bg-white/10 transition-colors font-medium"
          >
            <Home size={18} />
            MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
