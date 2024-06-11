// Basic setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const TILE_SIZE = 1; // Size of each block
const WORLD_WIDTH = 16;
const WORLD_DEPTH = 16;
const WORLD_HEIGHT = 32;

// Colors for different block types
const COLORS = {
    grass: 0x00ff00, // Green
    dirt: 0x8B4513, // Brown
    stone: 0x808080 // Grey
};

// Function to create a block
function createBlock(x, y, z, color) {
    let geometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let block = new THREE.Mesh(geometry, material);
    block.position.set(x * TILE_SIZE, y * TILE_SIZE, z * TILE_SIZE);
    return block;
}

// Generate the world
for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let z = 0; z < WORLD_DEPTH; z++) {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            let color;
            if (y < 10) {
                color = COLORS.stone; // Stone below y=10
            } else if (y < 20) {
                color = COLORS.dirt; // Dirt between y=10 and y=20
            } else {
                color = COLORS.grass; // Grass above y=20
            }
            let block = createBlock(x, y, z, color);
            scene.add(block);
        }
    }
}

camera.position.set(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE, WORLD_DEPTH * TILE_SIZE * 2);
camera.lookAt(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE / 2, WORLD_DEPTH * TILE_SIZE / 2);

// Add simple lighting
let light = new THREE.PointLight(0xffffff);
light.position.set(10, 10, 10);
scene.add(light);

// Stats setup
let stats = new Stats();
stats.dom.style.display = 'none'; // Hide stats initially
document.body.appendChild(stats.dom);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    
    stats.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Show/hide FPS stats on '[' key press
window.addEventListener('keydown', (event) => {
    if (event.key === '[') {
        if (stats.dom.style.display === 'none') {
            stats.dom.style.display = 'block';
        } else {
            stats.dom.style.display = 'none';
        }
    }
});
