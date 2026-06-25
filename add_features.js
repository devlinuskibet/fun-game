const fs = require('fs');
const { execSync } = require('child_process');

function commit(message) {
  execSync('git add .');
  execSync(`git commit -m "${message}"`);
  console.log('Committed: ' + message);
}

function replaceInFile(path, search, replace) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  if (content.indexOf(search) === -1) {
    console.error(`ERROR: Could not find match in ${path} for search:\n${search}`);
    process.exit(1);
  }
  content = content.replace(search, replace);
  fs.writeFileSync(path, content);
}

try {
  // --- Feature 3: Asteroid Score ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'store.updateInventory(a.resourceType, a.resourceYield);', 
    'store.updateInventory(a.resourceType, a.resourceYield);\n        store.updateStats({ score: (store.stats.score || 0) + 10 });'
  );
  commit('gameplay: extract valuable score data from asteroid fragments');

  // --- Feature 4: Enemy Score ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'store.addCredits(50);', 
    'store.addCredits(50);\n        store.updateStats({ score: (store.stats.score || 0) + 100 });'
  );
  commit('gameplay: siphon combat points from destroyed drones');

  // --- Feature 5: High Score save logic ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    "store.setGameState('GAME_OVER');", 
    "if ((store.stats.score || 0) > (store.stats.highScore || 0)) store.updateStats({ highScore: store.stats.score });\n        store.setGameState('GAME_OVER');"
  );
  commit('feat: persist historical high scores upon hull breach');

  // --- Feature 6: High Score on Main Menu ---
  replaceInFile('src/components/ui/MainMenu.tsx',
    'const setGameState = useGameStore((state) => state.setGameState);',
    'const setGameState = useGameStore((state) => state.setGameState);\n  const highScore = useGameStore((state) => state.stats.highScore);'
  );
  replaceInFile('src/components/ui/MainMenu.tsx', 
    '<Trophy size={20} className="text-accent" />', 
    '<Trophy size={20} className="text-accent" />\n            <span className="text-white/70 font-bold ml-2">High Score: {highScore || 0}</span>'
  );
  commit('ui: engrave historical high scores in the main menu archive');

  // --- Feature 7: Score on Game Over ---
  replaceInFile('src/components/ui/GameOver.tsx',
    'const inventory = useGameStore((state) => state.inventory);',
    'const inventory = useGameStore((state) => state.inventory);\n  const score = useGameStore((state) => state.stats.score);'
  );
  replaceInFile('src/components/ui/GameOver.tsx', 
    '<span>Credits:</span>', 
    '<span>Score:</span>\n            <span className="text-white font-bold">{score || 0}</span>\n          </div>\n          <div className="flex justify-between text-white/90 font-mono mb-1">\n            <span>Credits:</span>'
  );
  commit('ui: taunt players with their final score upon destruction');

  // --- Feature 8: Time Played UI ---
  replaceInFile('src/components/ui/HUD.tsx',
    'export default function HUD() {',
    'export default function HUD() {\n  const formatTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;'
  );
  replaceInFile('src/components/ui/HUD.tsx',
    '<h2 className="text-xl font-black text-white tracking-widest uppercase mb-4">Ship Status</h2>',
    '<h2 className="text-xl font-black text-white tracking-widest uppercase mb-4">Ship Status</h2>\n        <div className="absolute top-4 right-6 text-white/50 font-mono text-sm">T+{formatTime(stats.timePlayed || 0)}</div>'
  );
  commit('feat: initialize chronometer for expedition time tracking');

  // --- Feature 9: Time Played Logic ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);', 
    'store.updateStats({ timePlayed: (store.stats.timePlayed || 0) + dt });\n    const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);'
  );
  commit('physics: couple temporal flow to the main simulation loop');

  // --- Feature 10: CRT Visual effect ---
  replaceInFile('src/app/page.tsx', 
    '<GameCanvas />', 
    '<GameCanvas />\n      <div className="pointer-events-none absolute inset-0 z-40 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />'
  );
  commit('gfx: apply retro-futuristic cathode-ray tube visual filters');

  execSync('git push');
  console.log('Successfully pushed remaining 8 commits!');
} catch (e) {
  console.error(e);
}
