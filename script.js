// Smart Hydration App - JavaScript

// --- Global Variables ---
let timer;
let minutesLeft = 60;
let bluetoothDevice;
let server;
let writeCharacteristic;

// Three.js variables
let scene, camera, renderer, bottle, water, glowingBand, composer;
const BOTTLE_HEIGHT = 4;
const WATER_LEVEL_MAX = BOTTLE_HEIGHT * 0.9;
let waterFillTarget = 0;

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
  clearInterval(timer); // Reset any existing timer
  minutesLeft = 60;
  updateReminderText();

  timer = setInterval(() => {
    minutesLeft--;
    waterFillTarget = Math.max(0, (minutesLeft / 60) * WATER_LEVEL_MAX);
    updateReminderText();

    if (minutesLeft <= 0) {
      alert("Time to drink water! 💧");
      minutesLeft = 60;
      waterFillTarget = WATER_LEVEL_MAX;
    }
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
}

// --- Bluetooth Functions ---
async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["0000ffe0-0000-1000-8000-00805f9b34fb"], // HM-10/HC-05 UART Service
    });

    server = await bluetoothDevice.gatt.connect();
    document.getElementById("btStatus").innerText = "Bluetooth: Connected";

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
    console.log("Cannot send command, Bluetooth not connected.");
    return;
  }

  try {
    let encoder = new TextEncoder();
    await writeCharacteristic.writeValue(encoder.encode(cmd));
    console.log("Command sent:", cmd);
  } catch (error) {
    console.error("Failed to send command:", error);
  }
}

// --- Event Listeners for Commands ---
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const connectBtn = document.getElementById("connectBtn");
  const fillBtn = document.getElementById("fillBtn");

  if (startBtn) startBtn.addEventListener("click", startAlarm);
  if (stopBtn) stopBtn.addEventListener("click", stopAlarm);
  if (connectBtn) connectBtn.addEventListener("click", connectBluetooth);
  if (fillBtn) fillBtn.addEventListener("click", () => {
    waterFillTarget = WATER_LEVEL_MAX;
  });
});

// --- Three.js 3D Rendering ---
function init3D() {
  const canvas = document.getElementById("bottle-canvas");
  if (!canvas) {
    console.error("bottle-canvas element not found");
    return;
  }
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00000000);

  // Camera
  camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Bottle - Simple Cylinder Geometry (since no .glb file)
  const bottleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5,
  });
  
  const bottleGeometry = new THREE.CylinderGeometry(0.8, 0.9, BOTTLE_HEIGHT, 32);
  bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
  bottle.position.y = 0;
  scene.add(bottle);

  // Water
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x1ca3ec,
    roughness: 0.3,
    emissive: 0x0084d3,
    emissiveIntensity: 0.3,
  });
  const waterGeometry = new THREE.CylinderGeometry(0.75, 0.85, 1, 32);
  water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.scale.y = 0; // Start empty
  water.position.y = -BOTTLE_HEIGHT / 2 + 0.2;
  bottle.add(water);

  // Glowing Band
  const bandGeometry = new THREE.CylinderGeometry(0.95, 0.95, 0.3, 32);
  const bandMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0x00ffff,
    emissiveIntensity: 1,
  });
  glowingBand = new THREE.Mesh(bandGeometry, bandMaterial);
  glowingBand.position.y = 0;
  bottle.add(glowingBand);

  // Post-processing for Bloom Effect
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0;
  bloomPass.strength = 1.2;
  bloomPass.radius = 0.5;
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Handle window resizing
  window.addEventListener('resize', onWindowResize);

  animate();
}

function onWindowResize() {
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

  // Animate water level
  const currentScale = water.scale.y;
  const newScale = currentScale + (waterFillTarget - currentScale) * 0.05;
  water.scale.y = newScale;
  water.position.y = (-BOTTLE_HEIGHT + newScale) / 2;

  // Animate glowing band
  const time = Date.now() * 0.002;
  glowingBand.material.emissiveIntensity = Math.sin(time) * 0.5 + 0.5;

  renderer.render(scene, camera);
  composer.render();
}

// --- Initialization ---
init3D();
