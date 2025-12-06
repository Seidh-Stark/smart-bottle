// Smart Hydration App - JavaScript

let timer;
let minutesLeft = 60;

// Click events
document.getElementById("startBtn").addEventListener("click", startAlarm);
document.getElementById("stopBtn").addEventListener("click", stopAlarm);

function startAlarm() {
  stopAlarm();

  minutesLeft = 60;
  updateReminderText();

  timer = setInterval(() => {
    minutesLeft--;
    updateReminderText();

    if (minutesLeft <= 0) {
      alert("Time to drink water! 💧");
      minutesLeft = 60;
    }
  }, 60000);

  document.getElementById("btStatus").innerText = "Bluetooth: Connected (HC-05)";
}

function stopAlarm() {
  clearInterval(timer);
  document.getElementById("nextReminder").innerText = "Next reminder: stopped";
  document.getElementById("btStatus").innerText = "Bluetooth: Disconnected";
}

function updateReminderText() {
  document.getElementById("nextReminder").innerText =
    "Next reminder: " + minutesLeft + " minutes";
}
let bluetoothDevice;
let server;
let writeCharacteristic;

async function connectBluetooth() {
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // HM-10 UART Service
    });

    server = await bluetoothDevice.gatt.connect();
    document.getElementById("btStatus").innerText = "Bluetooth: Connected";

    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    writeCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    alert("Bluetooth Connected Successfully!");

  } catch (error) {
    console.log(error);
    alert("Bluetooth Connection Failed!");
  }
}

async function sendCommand(cmd) {
  if (!writeCharacteristic) {
    alert("Bluetooth not connected!");
    return;
  }

  let encoder = new TextEncoder();
  await writeCharacteristic.writeValue(encoder.encode(cmd));
  alert("Command sent: " + cmd);
}

document.getElementById("startBtn").addEventListener("click", () => {
  sendCommand("START");
});

document.getElementById("stopBtn").addEventListener("click", () => {
  sendCommand("STOP");
});

