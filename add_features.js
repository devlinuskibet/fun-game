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
  // --- Feature 8: Time Played UI ---
  // The HUD formatTime was already successfully added in a previous script run? Wait, no, it failed BEFORE that.
  let hudContent = fs.readFileSync('src/components/ui/HUD.tsx', 'utf8');
  if (!hudContent.includes('const formatTime')) {
    replaceInFile('src/components/ui/HUD.tsx',
      'export default function HUD() {',
      'export default function HUD() {\n  const formatTime = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;'
    );
  }
  
  if (!hudContent.includes('T+{formatTime')) {
    replaceInFile('src/components/ui/HUD.tsx',
      '<div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">',
      '<div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">\n      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm tracking-widest">T+{formatTime(stats.timePlayed || 0)}</div>'
    );
  }
  commit('feat: initialize chronometer for expedition time tracking');

  // --- Feature 9: Time Played Logic ---
  let glContent = fs.readFileSync('src/game/engine/GameLoop.ts', 'utf8');
  if (!glContent.includes('timePlayed: (store.stats.timePlayed')) {
    replaceInFile('src/game/engine/GameLoop.ts', 
      'const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);', 
      'store.updateStats({ timePlayed: (store.stats.timePlayed || 0) + dt });\n    const worldMousePos = this.cameraPos.add(this.inputManager.mousePos);'
    );
  }
  commit('physics: couple temporal flow to the main simulation loop');

  // --- Feature 10: CRT Visual effect ---
  let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
  if (!pageContent.includes('bg-[linear-gradient')) {
    replaceInFile('src/app/page.tsx', 
      '<GameCanvas />', 
      '<GameCanvas />\n      <div className="pointer-events-none absolute inset-0 z-40 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />'
    );
  }
  commit('gfx: apply retro-futuristic cathode-ray tube visual filters');

  execSync('git push');
  console.log('Successfully pushed remaining 3 commits!');
} catch (e) {
  console.error(e);
}
