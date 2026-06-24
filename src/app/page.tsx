"use client";

import { useGameStore } from '@/store/useGameStore';
import MainMenu from '@/components/ui/MainMenu';
import GameCanvas from '@/components/game/GameCanvas';
import HUD from '@/components/ui/HUD';
import GameOver from '@/components/ui/GameOver';
import UpgradeShop from '@/components/ui/UpgradeShop';

export default function Home() {
  const gameState = useGameStore((state) => state.gameState);
  const isShopOpen = useGameStore((state) => state.isShopOpen);
  const setShopOpen = useGameStore((state) => state.setShopOpen);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-background">
      {gameState === 'MENU' && <MainMenu />}
      
      {/* Game Canvas is always mounted, just hidden or paused when in menu, 
          but for simplicity in Phase 1, we can mount it conditionally, 
          or better yet, conditionally render the UI over it. 
          Actually, rendering UI over the canvas is better for background effects in the menu. 
          Let's mount canvas always, but have it react to gameState. */}
      
      
      <HUD />

      {/* The game canvas itself */}
      <GameCanvas />
      
      {/* Overlay background for menu to ensure readability if canvas is active behind */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 bg-black/60 z-[5]" />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && <GameOver />}

      {/* Upgrade Shop */}
      {isShopOpen && <UpgradeShop onClose={() => setShopOpen(false)} />}
    </main>
  );
}
