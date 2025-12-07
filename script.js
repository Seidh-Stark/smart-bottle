// Smart Hydration App - JavaScript

// --- Global Variables ---
let timer;
let minutesLeft = 60;
let bluetoothDevice;
let server;
let writeCharacteristic;

// Canvas variables
let canvas, ctx;
let waterLevel = 0;
let waterLevelTarget = 0;
const BOTTLE_HEIGHT = 300;
const BOTTLE_WIDTH = 120;
const WATER_LEVEL_MAX = BOTTLE_HEIGHT * 0.75;

// --- Alarm Functions ---
function startAlarm() {
  clearInterval(timer); // Reset any existing timer
  minutesLeft = 60;
  updateReminderText();

  timer = setInterval(() => {
    minutesLeft--;
    waterLevelTarget = Math.max(0, (minutesLeft / 60) * WATER_LEVEL_MAX);
    updateReminderText();

    if (minutesLeft <= 0) {
      alert("Time to drink water! 💧");
      minutesLeft = 60;
      waterLevelTarget = WATER_LEVEL_MAX;
    }
  }, 60000); // 60000ms = 1 minute

  document.getElementById("btStatus").innerText = "Bluetooth: Connected (HC-05)";
  sendCommand("START");
}

function stopAlarm() {
  clearInterval(timer);
  document.getElementById("nextReminder").innerText = "Next reminder: stopped";
  document.getElementById("btStatus").innerText = "Bluetooth: Disconnected";
  waterLevelTarget = 0; // Empty the bottle visually
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

  if (startBtn) startBtn.addEventListener("click", startAlarm);
  if (stopBtn) stopBtn.addEventListener("click", stopAlarm);
  if (connectBtn) connectBtn.addEventListener("click", connectBluetooth);
  
  // Initialize canvas after DOM is loaded
  initCanvas();
});

// --- Canvas 2D Rendering ---
function initCanvas() {
  canvas = document.getElementById("bottle-canvas");
  if (!canvas) {
    console.error("bottle-canvas element not found");
    return;
  }
  
  ctx = canvas.getContext("2d");
  
  // Set canvas size to match container
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  animate();
}

let rotation = 0;

function drawBottle() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  // Draw bottle with perspective/rotation effect
  rotation += 2;
  const perspectiveScale = Math.cos(rotation * Math.PI / 180) * 0.2 + 0.9;
  
  // Bottle outline
  ctx.strokeStyle = "rgba(173, 216, 230, 0.8)";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(173, 216, 230, 0.1)";
  
  // Draw bottle shape (curved)
  ctx.beginPath();
  // Cap
  ctx.fillRect(-15, -150, 30, 20);
  ctx.strokeRect(-15, -150, 30, 20);
  
  // Neck
  ctx.beginPath();
  ctx.moveTo(-20, -130);
  ctx.lineTo(-25, -80);
  ctx.lineTo(-30, -60);
  ctx.lineTo(-30, 60);
  ctx.quadraticCurveTo(-30, 80, -20, 90);
  ctx.lineTo(20, 90);
  ctx.quadraticCurveTo(30, 80, 30, 60);
  ctx.lineTo(30, -60);
  ctx.lineTo(25, -80);
  ctx.lineTo(20, -130);
  ctx.closePath();
  
  ctx.fill();
  ctx.stroke();
  
  // Draw water inside bottle
  const waterHeightInPixels = waterLevel;
  const waterY = 90 - waterHeightInPixels;
  
  // Water fill
  ctx.fillStyle = "rgba(28, 163, 236, 0.6)";
  ctx.beginPath();
  ctx.moveTo(-28, waterY);
  ctx.quadraticCurveTo(-28, 90, -20, 90);
  ctx.lineTo(20, 90);
  ctx.quadraticCurveTo(28, 90, 28, waterY);
  ctx.quadraticCurveTo(28, waterY - 5, 20, waterY);
  ctx.lineTo(-20, waterY);
  ctx.quadraticCurveTo(-28, waterY - 5, -28, waterY);
  ctx.closePath();
  ctx.fill();
  
  // Water shimmer effect
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-25, waterY - 3);
  ctx.lineTo(25, waterY - 3);
  ctx.stroke();
  
  // Glowing band around middle
  const glowIntensity = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
  ctx.strokeStyle = `rgba(0, 255, 255, ${glowIntensity * 0.8})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

function animate() {
  // Smooth water level animation
  const diff = waterLevelTarget - waterLevel;
  waterLevel += diff * 0.05;
  
  drawBottle();
  requestAnimationFrame(animate);
}
