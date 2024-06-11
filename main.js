// Basic setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load texture
let textureLoader = new THREE.TextureLoader();
let dirtTexture = textureLoader.load('dirt.png', () => {
    renderer.render(scene, camera);
});

// Create a simple box geometry with the dirt texture
let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ map: dirtTexture });
let cube = new THREE.Mesh(geometry, material);

scene.add(cube);
camera.position.z = 5;

// Add simple lighting
let light = new THREE.PointLight(0xffffff);
light.position.set(10, 10, 10);
scene.add(light);

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Simple rotation animation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
