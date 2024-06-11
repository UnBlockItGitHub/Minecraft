const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 32;
const MAP_WIDTH = Math.floor(canvas.width / TILE_SIZE);
const MAP_HEIGHT = Math.floor(canvas.height / TILE_SIZE);

// Generate a simple flat world
let world = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
    let row = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
        if (y > MAP_HEIGHT / 2) {
            row.push(1); // Dirt
        } else if (y === Math.floor(MAP_HEIGHT / 2)) {
            row.push(2); // Grass
        } else {
            row.push(0); // Air
        }
    }
    world.push(row);
}

function drawWorld() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (world[y][x] === 1) {
                ctx.fillStyle = '#8B4513'; // Dirt color
            } else if (world[y][x] === 2) {
                ctx.fillStyle = '#228B22'; // Grass color
            } else {
                ctx.fillStyle = '#87CEEB'; // Sky color
            }
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

drawWorld();
