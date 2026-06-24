import { Asteroid } from '../entities/Asteroid';
import { Vector2 } from '../utils/Vector2';

export class ProceduralGeneration {
  private chunkSize: number = 1000;
  private generatedChunks: Set<string> = new Set();
  
  // How many chunks around the player should be populated
  private renderDistance: number = 2;

  public update(playerPos: Vector2, asteroids: Asteroid[]) {
    // Determine current chunk
    const currentChunkX = Math.floor(playerPos.x / this.chunkSize);
    const currentChunkY = Math.floor(playerPos.y / this.chunkSize);

    // Check surrounding chunks
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let y = -this.renderDistance; y <= this.renderDistance; y++) {
        const chunkX = currentChunkX + x;
        const chunkY = currentChunkY + y;
        const chunkId = `${chunkX},${chunkY}`;

        if (!this.generatedChunks.has(chunkId)) {
          this.generateChunk(chunkX, chunkY, asteroids);
          this.generatedChunks.add(chunkId);
        }
      }
    }
  }

  private generateChunk(chunkX: number, chunkY: number, asteroids: Asteroid[]) {
    const numAsteroids = Math.floor(Math.random() * 5) + 3; // 3 to 7 asteroids per chunk
    
    for (let i = 0; i < numAsteroids; i++) {
      // Random position within the chunk
      const x = chunkX * this.chunkSize + Math.random() * this.chunkSize;
      const y = chunkY * this.chunkSize + Math.random() * this.chunkSize;
      
      const radius = 20 + Math.random() * 40; // 20 to 60 radius
      
      asteroids.push(new Asteroid(x, y, radius));
    }
  }
}
