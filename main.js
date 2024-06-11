// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const TILE_SIZE = 1;
const WORLD_WIDTH = 16;
const WORLD_DEPTH = 16;
const WORLD_HEIGHT = 32;

// Colors for different block types
const COLORS = {
    grass: 0x00ff00,
    dirt: 0x8B4513,
    stone: 0x808080
};

// Function to create a block
function createBlock(x, y, z, color) {
    const geometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
    const material = new THREE.MeshBasicMaterial({ color });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x * TILE_SIZE, y * TILE_SIZE, z * TILE_SIZE);
    return block;
}

// Generate the world
for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let z = 0; z < WORLD_DEPTH; z++) {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            let color;
            if (y < 10) {
                color = COLORS.stone;
            } else if (y < 20) {
                color = COLORS.dirt;
            } else {
                color = COLORS.grass;
            }
            const block = createBlock(x, y, z, color);
            scene.add(block);
        }
    }
}

// Set up camera position
camera.position.set(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE, WORLD_DEPTH * TILE_SIZE * 2);
camera.lookAt(new THREE.Vector3(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE / 2, WORLD_DEPTH * TILE_SIZE / 2));

// Add simple lighting
const light
