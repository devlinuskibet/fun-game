"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Play, Settings, Trophy } from 'lucide-react';

export default function MainMenu() {
  const setGameState = useGameStore((state) => state.setGameState);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-4 drop-shadow-lg">
          GALAXY SALVAGER
        </h1>
        <p className="text-xl text-foreground/80 tracking-widest font-mono">THE LOST SECTORS</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col gap-4 w-64"
      >
        <button
          onClick={() => setGameState('PLAYING')}
          className="glass-button flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-semibold text-white tracking-wider hover:scale-105 transition-transform"
        >
          <Play size={24} />
          START EXPEDITION
        </button>

        <button className="glass-panel flex items-center justify-center gap-3 py-3 px-6 rounded-lg text-md font-medium text-white/80 hover:bg-white/10 transition-colors">
          <Trophy size={20} />
          LEADERBOARD
        </button>

        <button className="glass-panel flex items-center justify-center gap-3 py-3 px-6 rounded-lg text-md font-medium text-white/80 hover:bg-white/10 transition-colors">
          <Settings size={20} />
          SETTINGS
        </button>
      </motion.div>
    </div>
  );
}
