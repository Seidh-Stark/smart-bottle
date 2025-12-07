// Smart Hydration App - JavaScript

// --- Global Variables ---
let timer;
let minutesLeft = 60;
let bluetoothDevice;
let server;
let writeCharacteristic;

// Click events
// Three.js variables
let scene, camera, renderer, bottle, water, glowingBand;
let scene, camera, renderer, bottle, water, glowingBand, composer;
const BOTTLE_HEIGHT = 4;
const WATER_LEVEL_MAX = BOTTLE_HEIGHT * 0.9;
let waterFillTarget = WATER_LEVEL_MAX;

// --- Event Listeners ---
document.getElementById("startBtn").addEventListener("click", startAlarm);
document.getElementById("stopBtn").addEventListener("click", stopAlarm);
document.getElementById("connectBtn").addEventListener("click", connectBluetooth);
document.getElementById("fillBtn").addEventListener("click", () => {
    waterFillTarget = WATER_LEVEL_MAX;
  waterFillTarget = WATER_LEVEL_MAX;
});

// --- Alarm Functions ---
function startAlarm() {
  stopAlarm();

  stopAlarm(); // Reset any existing timer
  minutesLeft = 60;
  updateReminderText();

  timer = setInterval(() => {
    minutesLeft--;
    waterFillTarget = Math.max(0, (minutesLeft / 60) * WATER_LEVEL_MAX);
    updateReminderText();

    if (minutesLeft <= 0) {
      alert("Time to drink water! 💧");
      minutesLeft = 60;
      minutesLeft = 60; // Reset for the next hour
      waterFillTarget = WATER_LEVEL_MAX; // Animate refill after alert
    }
  }, 60000);
  }, 60000); // 60000ms = 1 minute

  document.getElementById("btStatus").innerText = "Bluetooth: Connected (HC-05)";
  sendCommand("START");
}

function stopAlarm() {
  clearInterval(timer);
  document.getElementById("nextReminder").innerText = "Next reminder: stopped";
  document.getElementById("btStatus").innerText = "Bluetooth: Disconnected";
  waterFillTarget = 0; // Empty the bottle visually
  sendCommand("STOP");
}

function updateReminderText() {
  document.getElementById("nextReminder").innerText =
    "Next reminder: " + minutesLeft + " minutes";
    `Next reminder: ${minutesLeft} minutes`;
}
let bluetoothDevice;
let server;
let writeCharacteristic;

// --- Bluetooth Functions ---
async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // HM-10 UART Service
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"], // HM-10/HC-05 UART Service
    });

    server = await bluetoothDevice.gatt.connect();
    document.getElementById("btStatus").innerText = "Bluetooth: Connected";

    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    writeCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
    const service = await server.getPrimaryService(
      "0000ffe0-0000-1000-8000-00805f9b34fb"
    );
    writeCharacteristic = await service.getCharacteristic(
      "0000ffe1-0000-1000-8000-00805f9b34fb"
    );

    alert("Bluetooth Connected Successfully!");

  } catch (error) {
    console.log(error);
    console.error("Bluetooth Error:", error);
    alert("Bluetooth Connection Failed!");
  }
}

async function sendCommand(cmd) {
  if (!writeCharacteristic) {
    alert("Bluetooth not connected!");
    console.log("Cannot send command, Bluetooth not connected.");
    return;
  }

  let encoder = new TextEncoder();
  await writeCharacteristic.writeValue(encoder.encode(cmd));
  alert("Command sent: " + cmd);
  try {
    let encoder = new TextEncoder();
    await writeCharacteristic.writeValue(encoder.encode(cmd));
    console.log("Command sent:", cmd);
  } catch (error) {
    console.error("Failed to send command:", error);
  }
}

document.getElementById("startBtn").addEventListener("click", () => {
  sendCommand("START");
});
// --- Three.js 3D Rendering ---
function init3D() {
  const canvas = document.getElementById("bottle-canvas");
  scene = new THREE.Scene();

document.getElementById("stopBtn").addEventListener("click", () => {
  sendCommand("STOP");
});
  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Bottle
  const bottleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0,
    transmission: 0.9,
    ior: 1.5,
  });
  const bottleGeometry = new THREE.CylinderGeometry(1, 1, BOTTLE_HEIGHT, 32);
  bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
  scene.add(bottle);
  // GLTF Model Loader
  const loader = new THREE.GLTFLoader();
  loader.load('bottle.glb', (gltf) => {
    bottle = gltf.scene;
    bottle.scale.set(4, 4, 4); // Adjust scale as needed
    bottle.position.y = -2; // Adjust position

  // Water
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x1ca3ec,
    roughness: 0.3,
  });
  const waterGeometry = new THREE.CylinderGeometry(0.95, 0.95, 1, 32); // Height is 1, we scale it
  water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.scale.y = 0; // Start empty
  water.position.y = -BOTTLE_HEIGHT / 2;
  bottle.add(water); // Add water as a child of the bottle
    // Find and assign materials if needed
    bottle.traverse((child) => {
        if (child.isMesh) {
            // Example: Make part of the bottle transparent
            if (child.name === "Bottle_Body") {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    transmission: 0.9,
                    opacity: 0.3,
                    metalness: 0,
                    roughness: 0.1,
                    ior: 1.5,
                    transparent: true,
                });
            }
        }
    });

  // Glowing Band
  const bandGeometry = new THREE.CylinderGeometry(1.05, 1.05, 0.5, 32);
  const bandMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff, // This makes it glow
      emissiveIntensity: 1,
    color: 0x00ffff,
    emissive: 0x00ffff, // This makes it glow
    emissiveIntensity: 1,
    scene.add(bottle);
  }, undefined, (error) => {
      console.error('An error happened while loading the model:', error);
  });
  glowingBand = new THREE.Mesh(bandGeometry, bandMaterial);
  glowingBand.position.y = 0;
  bottle.add(glowingBand);

  // Post-processing for Bloom Effect
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 1.2; // Glow intensity
  bloomPass.radius = 0.5;
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Handle window resizing
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener("resize", onWindowResize, false);

  animate();
}

function onWindowResize() {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  composer.setSize(canvas.clientWidth, canvas.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // Automatic rotation
  bottle.rotation.y += 0.005;
  if (bottle) {
    // Automatic rotation
    bottle.rotation.y += 0.005;
  }

  // Animate water level
  const currentScale = water.scale.y;
  const newScale = currentScale + (waterFillTarget - currentScale) * 0.05;
  water.scale.y = newScale;
  water.position.y = (-BOTTLE_HEIGHT + newScale) / 2;
  // The rest of your animation logic for water and glowing band
  // would go here, likely interacting with named objects from the loaded model.

  // Animate glowing band
  const time = Date.now() * 0.002;
  glowingBand.material.emissiveIntensity = Math.sin(time) * 0.5 + 0.5;

  renderer.render(scene, camera);
  composer.render();
}

// --- Initialization ---
init3D();
