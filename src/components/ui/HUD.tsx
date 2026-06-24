"use client";

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

export default function HUD() {
  const stats = useGameStore((state) => state.stats);
  const inventory = useGameStore((state) => state.inventory);
  const gameState = useGameStore((state) => state.gameState);

  if (gameState !== 'PLAYING') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">
      {/* Top Left: Stats */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-4 rounded-lg w-64 pointer-events-auto"
      >
        <div className="mb-2">
          <div className="flex justify-between text-xs font-mono text-white/80 mb-1">
            <span>HULL INTEGRITY</span>
            <span>{stats.health} / {stats.maxHealth}</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs font-mono text-white/80 mb-1">
            <span>ENERGY SHIELDS</span>
            <span>{stats.shield} / {stats.maxShield}</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded overflow-hidden">
            <div 
              className="h-full bg-secondary transition-all duration-300"
              style={{ width: `${(stats.shield / stats.maxShield) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Top Right: Inventory */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel p-4 rounded-lg w-48 self-end pointer-events-auto"
      >
        <h3 className="text-white/90 text-sm font-bold tracking-wider mb-2 border-b border-white/10 pb-1">CARGO HOLD</h3>
        <ul className="text-sm font-mono text-white/70 space-y-1">
          {Object.entries(inventory.resources).map(([res, amt]) => (
            <li key={res} className="flex justify-between">
              <span>{res}</span>
              <span className="text-accent">{amt}</span>
            </li>
          ))}
          {Object.keys(inventory.resources).length === 0 && (
            <li className="text-white/40 italic">Empty</li>
          )}
        </ul>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70 font-bold">Credits</span>
            <span className="text-accent font-mono font-bold">{inventory.credits} ¢</span>
          </div>
          <button
            onClick={() => useGameStore.getState().setShopOpen(true)}
            className="w-full py-2 bg-secondary/20 hover:bg-secondary/40 text-secondary rounded flex items-center justify-center gap-2 transition-colors font-bold tracking-widest text-xs"
          >
            <ShoppingCart size={14} />
            UPGRADE SHOP
          </button>
        </div>
      </motion.div>

      {/* Bottom Center: Controls Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="self-center mb-4 text-center glass-panel px-6 py-2 rounded-full"
      >
        <p className="text-xs font-mono text-white/60">
          [W,A,S,D] Move • Mouse Aim • Click/E Shoot • Space Boost
        </p>
      </motion.div>
    </div>
  );
}
