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

            if (transitionProgress < 0.5) {
                float t = transitionProgress * 2.0;
                color = mix(topColor, middleColor, t);
            } else {
                float t = (transitionProgress - 0.5) * 2.0;
                color = mix(middleColor, bottomColor, t);
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `,
    side: THREE.BackSide
});
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Pointer Lock Controls
const controls = new THREE.PointerLockControls(camera, document.body);
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

    // Update skybox color transition
    const elapsedTime = (Date.now() - startTime) / 600000; // 10 minutes in milliseconds
    skyboxMaterial.uniforms.transitionProgress.value = elapsedTime % 1.0;

    // Movement controls
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
