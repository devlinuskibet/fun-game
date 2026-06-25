import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  fuel: number;
  maxFuel: number;
  experience: number;
  level: number;
  // Upgrades
  damageMultiplier: number;
  speedMultiplier: number;
  score: number;
  highScore: number;
  timePlayed: number;
}

export interface Inventory {
  capacity: number;
  resources: Record<string, number>; // e.g., { "Iron": 10, "Titanium": 5 }
  credits: number;
}

interface GameStore {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  stats: PlayerStats;
  updateStats: (updates: Partial<PlayerStats>) => void;
  
  inventory: Inventory;
  updateInventory: (resource: string, amount: number) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  buyUpgrade: (upgradeType: 'damage' | 'speed' | 'health' | 'shield') => boolean;
  isShopOpen: boolean;
  setShopOpen: (open: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: 'MENU',
      setGameState: (state) => set({ gameState: state }),
      
      isShopOpen: false,
      setShopOpen: (open) => set({ isShopOpen: open }),

      stats: {
        health: 100,
        maxHealth: 100,
        shield: 100,
        maxShield: 100,
        energy: 100,
        maxEnergy: 100,
        fuel: 100,
      score: 0,
      timePlayed: 0,
        maxFuel: 100,
        experience: 0,
        level: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        score: 0,
        highScore: 0,
        timePlayed: 0,
      },
      updateStats: (updates) =>
        set((state) => ({
          stats: { ...state.stats, ...updates },
        })),

  inventory: {
    capacity: 50,
    resources: {},
    credits: 0,
  },
  updateInventory: (resource, amount) =>
    set((state) => {
      const currentAmount = state.inventory.resources[resource] || 0;
      return {
        inventory: {
          ...state.inventory,
          resources: {
            ...state.inventory.resources,
            [resource]: Math.max(0, currentAmount + amount),
          },
        },
      };
    }),
  addCredits: (amount) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        credits: Math.max(0, state.inventory.credits + amount),
      },
    })),
  spendCredits: (amount) => {
    const state = get();
    if (state.inventory.credits >= amount) {
      set({
        inventory: {
          ...state.inventory,
          credits: state.inventory.credits - amount,
        },
      });
      return true;
    }
    return false;
  },
  buyUpgrade: (type) => {
    const cost = 100; // Flat cost for prototype
    const state = get();
    if (state.inventory.credits >= cost) {
      set({
        inventory: { ...state.inventory, credits: state.inventory.credits - cost },
        stats: {
          ...state.stats,
          damageMultiplier: type === 'damage' ? state.stats.damageMultiplier + 0.2 : state.stats.damageMultiplier,
          speedMultiplier: type === 'speed' ? state.stats.speedMultiplier + 0.2 : state.stats.speedMultiplier,
          maxHealth: type === 'health' ? state.stats.maxHealth + 20 : state.stats.maxHealth,
          maxShield: type === 'shield' ? state.stats.maxShield + 20 : state.stats.maxShield,
          // Heal when upgrading max health
          health: type === 'health' ? state.stats.maxHealth + 20 : state.stats.health,
          shield: type === 'shield' ? state.stats.maxShield + 20 : state.stats.shield,
        }
      });
      return true;
    }
    return false;
  }
    }),
    {
      name: 'galaxy-salvager-storage',
      partialize: (state) => ({ stats: state.stats, inventory: state.inventory }),
    }
  )
);
