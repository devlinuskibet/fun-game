import { create } from 'zustand';

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
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'MENU',
  setGameState: (state) => set({ gameState: state }),

  stats: {
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    energy: 100,
    maxEnergy: 100,
    fuel: 100,
    maxFuel: 100,
    experience: 0,
    level: 1,
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
}));
