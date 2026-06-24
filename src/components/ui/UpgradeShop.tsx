"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Wrench, Zap, Shield, Heart, X } from 'lucide-react';

export default function UpgradeShop({ onClose }: { onClose: () => void }) {
  const inventory = useGameStore((state) => state.inventory);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  const handleBuy = (type: 'damage' | 'speed' | 'health' | 'shield') => {
    buyUpgrade(type);
  };

  const cost = 100;

  const upgrades = [
    { type: 'damage' as const, name: 'Laser Focusing Lens', icon: <Zap className="text-accent" />, desc: '+20% Damage' },
    { type: 'speed' as const, name: 'Ion Thrusters', icon: <Wrench className="text-secondary" />, desc: '+20% Speed' },
    { type: 'health' as const, name: 'Reinforced Hull', icon: <Heart className="text-danger" />, desc: '+20 Max Health' },
    { type: 'shield' as const, name: 'Deflector Overcharge', icon: <Shield className="text-primary" />, desc: '+20 Max Shield' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-xl max-w-2xl w-full"
      >
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
            BLACK MARKET UPGRADES
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex justify-between items-center bg-black/30 p-4 rounded-lg mb-6">
          <span className="text-white/70 font-mono tracking-widest">AVAILABLE CREDITS</span>
          <span className="text-2xl font-bold text-accent font-mono">{inventory.credits} ¢</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades.map((up) => {
            const canAfford = inventory.credits >= cost;
            return (
              <div key={up.name} className="glass-panel p-4 rounded-lg flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  {up.icon}
                  <h3 className="text-lg font-bold text-white/90">{up.name}</h3>
                </div>
                <p className="text-sm text-white/50 mb-4">{up.desc}</p>
                <button
                  onClick={() => handleBuy(up.type)}
                  disabled={!canAfford}
                  className={`mt-auto py-2 rounded font-bold tracking-wider transition-colors ${
                    canAfford
                      ? 'bg-primary/20 text-primary border border-primary/50 hover:bg-primary/40'
                      : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  BUY ({cost} ¢)
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
