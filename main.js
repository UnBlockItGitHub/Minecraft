import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import Stats from './stats.module.js';

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

// World array to keep track of blocks
const world = Array.from({ length: WORLD_WIDTH }, () =>
    Array.from({ length: WORLD_HEIGHT }, () =>
        Array.from({ length: WORLD_DEPTH }, () => null)
    )
);

// Function to create a block face
function createFace(size, position, rotation, color) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const face = new THREE.Mesh(geometry, material);
    face.position.set(position.x, position.y, position.z);
    face.rotation.set(rotation.x, rotation.y, rotation.z);
    return face;
}

// Function to check if a block exists at a given position
function blockExists(x, y, z) {
    return (
        x >= 0 && x < WORLD_WIDTH &&
        y >= 0 && y < WORLD_HEIGHT &&
        z >= 0 && z < WORLD_DEPTH &&
        world[x][y][z] !== null
    );
}

// Function to create a block
function createBlock(x, y, z, color) {
    const size = TILE_SIZE;
    const halfSize = size / 2;
    
    if (!blockExists(x, y, z)) {
        const block = new THREE.Group();

        // Add faces only if they are exposed
        if (!blockExists(x, y + 1, z)) { // Top face
            block.add(createFace(size, { x: x * size, y: y * size + halfSize, z: z * size }, { x: -Math.PI / 2, y: 0, z: 0 }, color));
        }
        if (!blockExists(x, y - 1, z)) { // Bottom face
            block.add(createFace(size, { x: x * size, y: y * size - halfSize, z: z * size }, { x: Math.PI / 2, y: 0, z: 0 }, color));
        }
        if (!blockExists(x, y, z + 1)) { // Front face
            block.add(createFace(size, { x: x * size, y: y * size, z: z * size + halfSize }, { x: 0, y: 0, z: 0 }, color));
        }
        if (!blockExists(x, y, z - 1)) { // Back face
            block.add(createFace(size, { x: x * size, y: y * size, z: z * size - halfSize }, { x: 0, y: Math.PI, z: 0 }, color));
        }
        if (!blockExists(x + 1, y, z)) { // Right face
            block.add(createFace(size, { x: x * size + halfSize, y: y * size, z: z * size }, { x: 0, y: -Math.PI / 2, z: 0 }, color));
        }
        if (!blockExists(x - 1, y, z)) { // Left face
            block.add(createFace(size, { x: x * size - halfSize, y: y * size, z: z * size }, { x: 0, y: Math.PI / 2, z: 0 }, color));
        }

        world[x][y][z] = block;
        scene.add(block);
    }
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
            } else if (y === 20) {
                color = COLORS.grass;
            } else {
                color = COLORS.dirt;
            }
            createBlock(x, y, z, color);
        }
    }
}

// Set up camera position
camera.position.set(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE, WORLD_DEPTH * TILE_SIZE * 2);
camera.lookAt(new THREE.Vector3(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE / 2, WORLD_DEPTH * TILE_SIZE / 2));

// Add simple lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(WORLD_WIDTH * TILE_SIZE / 2, WORLD_HEIGHT * TILE_SIZE, WORLD_DEPTH * TILE_SIZE / 2);
scene.add(light);

// Stats setup
const stats = new Stats();
stats.dom.style.display = 'none';
document.body.appendChild(stats.dom);

// Skybox setup
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skyboxMaterial = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { type: 'c', value: new THREE.Color(0x87CEEB) },
        middleColor: { type: 'c', value: new THREE.Color(0xFFA500) },
        bottomColor: { type: 'c', value: new THREE.Color(0x000000) },
        transitionProgress: { type: 'f', value: 0 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        uniform float transitionProgress;
        varying vec3 vWorldPosition;

        void main() {
            float height = vWorldPosition.y / 500.0 + 0.5;
            vec3 color;

            float t = transitionProgress * 4.0;
            if (t < 1.0) {
                color = mix(topColor, middleColor, t);
            } else if (t < 2.0) {
                color = mix(middleColor, bottomColor, t - 1.0);
            } else if (t < 3.0) {
                color = mix(bottomColor, middleColor, t - 2.0);
            } else {
                color = mix(middleColor, topColor, t - 3.0);
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `,
    side: THREE.BackSide
});
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Pointer Lock Controls
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener('click', () => {
    controls.lock();
});

// Movement controls
const movement = { forward: false, backward: false, left: false, right: false, up: false, down: false };

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': movement.forward = true; break;
        case 'KeyS': movement.backward = true; break;
        case 'KeyA': movement.left = true; break;
        case 'KeyD': movement.right = true; break;
        case 'Space': movement.up = true; break;
        case 'ShiftLeft': movement.down = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': movement.forward = false; break;
        case 'KeyS': movement.backward = false; break;
        case 'KeyA': movement.left = false; break;
        case 'KeyD': movement.right = false; break;
        case 'Space': movement.up = false; break;
        case 'ShiftLeft': movement.down = false; break;
    }
});

// Render loop
const startTime = Date.now();
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = (Date.now() - startTime) / 1000;
    const dayDuration = 20 * 60; // 20 minutes in seconds
    skyboxMaterial.uniforms.transitionProgress.value = (elapsedTime % dayDuration) / dayDuration;

    const delta = 0.1;
    if (movement.forward) controls.moveForward(delta);
    if (movement.backward) controls.moveForward(-delta);
    if (movement.left) controls.moveRight(-delta);
    if (movement.right) controls.moveRight(delta);
    if (movement.up) controls.getObject().position.y += delta;
    if (movement.down) controls.getObject().position.y -= delta;

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
