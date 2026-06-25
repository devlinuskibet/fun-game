const fs = require('fs');
const { execSync } = require('child_process');

function commit(message) {
  execSync('git add .');
  execSync(`git commit -m "${message}"`);
  console.log('Committed: ' + message);
}

function replaceInFile(path, search, replace) {
  let content = fs.readFileSync(path, 'utf8');
  const normalizedSearch = search.replace(/\n/g, '\r?\n');
  const regex = new RegExp(normalizedSearch);
  if (!regex.test(content)) {
    console.error(`ERROR: Could not find match in ${path} for ${search}`);
    process.exit(1);
  }
  content = content.replace(regex, replace);
  fs.writeFileSync(path, content);
}

try {
  // --- Feature 1: Store updates for score ---
  replaceInFile('src/store/useGameStore.ts',
    'speedMultiplier: number;',
    'speedMultiplier: number;\n  score: number;\n  highScore: number;\n  timePlayed: number;'
  );
  replaceInFile('src/store/useGameStore.ts',
    'speedMultiplier: 1,',
    'speedMultiplier: 1,\n        score: 0,\n        highScore: 0,\n        timePlayed: 0,'
  );
  replaceInFile('src/store/useGameStore.ts',
    'fuel: 100,',
    'fuel: 100,\n      score: 0,\n      timePlayed: 0,'
  );
  commit('feat: integrate quantum score tracking matrix');

  // --- Feature 2: HUD Score Display ---
  replaceInFile('src/components/ui/HUD.tsx', 
    '<span className="text-white/70 font-bold">Credits</span>', 
    '<span className="text-white/70 font-bold">Score</span>\n            <span className="text-accent font-mono font-bold">{stats.score}</span>\n          </div>\n          <div className="flex justify-between items-center text-sm">\n            <span className="text-white/70 font-bold">Credits</span>'
  );
  commit('ui: project real-time score telemetry to HUD');

  // --- Feature 3: Asteroid Score ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'store.updateInventory(a.resourceType, a.resourceYield);', 
    'store.updateInventory(a.resourceType, a.resourceYield);\n        store.updateStats({ score: store.stats.score + 10 });'
  );
  commit('gameplay: extract valuable score data from asteroid fragments');

  // --- Feature 4: Enemy Score ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'store.addCredits(50);', 
    'store.addCredits(50);\n        store.updateStats({ score: store.stats.score + 100 });'
  );
  commit('gameplay: siphon combat points from destroyed drones');

  // --- Feature 5: High Score save logic ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    "store.setGameState('GAME_OVER');", 
    "if (store.stats.score > store.stats.highScore) store.updateStats({ highScore: store.stats.score });\n        store.setGameState('GAME_OVER');"
  );
  commit('feat: persist historical high scores upon hull breach');

  // --- Feature 6: High Score on Main Menu ---
  replaceInFile('src/components/ui/MainMenu.tsx',
    'const setGameState = useGameStore((state) => state.setGameState);',
    'const setGameState = useGameStore((state) => state.setGameState);\n  const highScore = useGameStore((state) => state.stats.highScore);'
  );
  replaceInFile('src/components/ui/MainMenu.tsx', 
    '<Trophy size={20} className="text-accent" />', 
    '<Trophy size={20} className="text-accent" />\n            <span className="text-white/70 font-bold ml-2">High Score: {highScore}</span>'
  );
  commit('ui: engrave historical high scores in the main menu archive');

  // --- Feature 7: Score on Game Over ---
  replaceInFile('src/components/ui/GameOver.tsx',
    'const inventory = useGameStore((state) => state.inventory);',
    'const inventory = useGameStore((state) => state.inventory);\n  const score = useGameStore((state) => state.stats.score);'
  );
  replaceInFile('src/components/ui/GameOver.tsx', 
    '<span>Credits:</span>', 
    '<span>Score:</span>\n            <span className="text-white font-bold">{score}</span>\n          </div>\n          <div className="flex justify-between text-white/90 font-mono mb-1">\n            <span>Credits:</span>'
  );
  commit('ui: taunt players with their final score upon destruction');

  // --- Feature 8: Time Played UI ---
  replaceInFile('src/components/ui/HUD.tsx',
    'export default function HUD() {',
    'export default function HUD() {\n  const formatTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;'
  );
  commit('feat: initialize chronometer for expedition time tracking');

  // --- Feature 9: Time Played Logic ---
  replaceInFile('src/game/engine/GameLoop.ts', 
    'const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);', 
    'store.updateStats({ timePlayed: store.stats.timePlayed + dt });\n    const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);'
  );
  commit('physics: couple temporal flow to the main simulation loop');

  // --- Feature 10: CRT Visual effect ---
  replaceInFile('src/app/page.tsx', 
    '<GameCanvas />', 
    '<GameCanvas />\n      <div className="pointer-events-none absolute inset-0 z-40 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />'
  );
  commit('gfx: apply retro-futuristic cathode-ray tube visual filters');

  execSync('git push');
  console.log('Successfully pushed 10 commits!');
} catch (e) {
  console.error(e);
}
