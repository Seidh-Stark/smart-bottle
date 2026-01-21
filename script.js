const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CONTROL_UUID = "abcd1234-5678-90ab-cdef-1234567890ab";
const BATTERY_UUID = 0x180F;
const BATTERY_LEVEL_UUID = 0x2A19;

let device;
let server;
let controlChar;
let batteryChar;
let timerInterval = null;
let alarmDuration = 120; // default 2 minutes

async function connectBluetooth() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'SmartHydrationBottle' }],
      optionalServices: [SERVICE_UUID, BATTERY_UUID]
    });

    server = await device.gatt.connect();

    const service = await server.getPrimaryService(SERVICE_UUID);
    controlChar = await service.getCharacteristic(CONTROL_UUID);

    const batteryService = await server.getPrimaryService(BATTERY_UUID);
    batteryChar = await batteryService.getCharacteristic(BATTERY_LEVEL_UUID);

    batteryChar.startNotifications();
    batteryChar.addEventListener('characteristicvaluechanged', e => {
      const level = e.target.value.getUint8(0);
      updateBatteryDisplay(level);
    });

    // Update button to show connected state
    const btn = document.getElementById('connectBtn');
    btn.textContent = '✅ Connected';
    btn.classList.add('connected');
    btn.classList.remove('blue');
    btn.onclick = null; // disable reconnect
    
    alert("✅ Bluetooth Connected!");
  } catch (error) {
    alert("❌ Bluetooth connection failed");
    console.error(error);
  }
}

function updateBatteryDisplay(level){
  document.getElementById('batteryText').textContent = level + '%';
  const fill = document.getElementById('batteryFill');
  fill.style.width = level + '%';
  
  // color based on level
  if(level > 60) fill.style.background = 'linear-gradient(90deg, #7ee787, #2ecc71)';
  else if(level > 30) fill.style.background = 'linear-gradient(90deg, #ffd700, #ff9500)';
  else fill.style.background = 'linear-gradient(90deg, #ff7b7b, #d63031)';
}

function setIntervalSeconds(){
  const input = document.getElementById('alarmTime');
  const minutes = parseInt(input.value) || 2;
  const seconds = minutes * 60;
  alarmDuration = seconds;
  
  if(!controlChar) return alert("❌ Bluetooth not connected");
  controlChar.writeValue(new TextEncoder().encode("SET:" + seconds));
  alert("⏱ Alarm interval set to " + minutes + " minute(s)");
}

function startAlarm(){
  if(!controlChar) return alert("❌ Bluetooth not connected");
  
  updateButtonState('start');
  controlChar.writeValue(new TextEncoder().encode("START"));
  
  // start countdown timer
  startCountdownTimer(alarmDuration);
}

function stopAlarm(){
  if(!controlChar) return alert("❌ Bluetooth not connected");
  
  updateButtonState('stop');
  controlChar.writeValue(new TextEncoder().encode("STOP"));
  
  // stop timer
  if(timerInterval) clearInterval(timerInterval);
  document.getElementById('timerDisplay').style.display = 'none';
}

function startCountdownTimer(seconds){
  const display = document.getElementById('timerDisplay');
  display.style.display = 'block';
  
  let remaining = seconds;
  
  const updateDisplay = () => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    document.getElementById('timerValue').textContent = timeStr;
    
    if(remaining <= 0){
      clearInterval(timerInterval);
      document.getElementById('timerValue').textContent = '⏰ DONE!';
      document.getElementById('timerValue').style.color = '#ffd700';
      // auto stop after 2 seconds
      setTimeout(() => {
        display.style.display = 'none';
        document.getElementById('timerValue').style.color = '#fff';
      }, 2000);
    }
    remaining--;
  };
  
  updateDisplay();
  timerInterval = setInterval(updateDisplay, 1000);
}

// ---- UI Enhancements: typing subtitle, ripple effect, and simple parallax ----

document.addEventListener('DOMContentLoaded', () => {
  initTyping('.subtitle');
  attachButtonRipples();
  initParallax('#app');
});

function initTyping(selector){
  const el = document.querySelector(selector);
  if(!el) return;
  const text = el.dataset.text || el.textContent.trim();
  el.textContent = '';
  let i = 0;
  const speed = 40;
  function step(){
    if(i <= text.length){
      el.textContent = text.slice(0,i) + (i % 2 === 0 ? '|' : '');
      i++;
      setTimeout(step, speed);
    } else {
      el.textContent = text;
    }
  }
  step();
}

function attachButtonRipples(){
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 0.8;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

function initParallax(selector){
  const node = document.querySelector(selector);
  if(!node) return;
  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    const dx = (e.clientX - cx) / cx; // -1..1
    const dy = (e.clientY - cy) / cy;
    const tx = dx * 8; // translate range
    const ty = dy * 6;
    const rot = dx * 2;
    node.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
  });
  // smooth return when mouse leaves
  window.addEventListener('mouseleave', () => node.style.transform = '');
}

// Toggle visual active/inactive state between start and stop buttons
function updateButtonState(state){
  const start = document.getElementById('startBtn');
  const stop = document.getElementById('stopBtn');
  if(!start || !stop) return;
  if(state === 'start'){
    start.classList.add('active');
    start.classList.remove('inactive');
    stop.classList.remove('active');
    stop.classList.add('inactive');
  } else if(state === 'stop'){
    stop.classList.add('active');
    stop.classList.remove('inactive');
    start.classList.remove('active');
    start.classList.add('inactive');
  }
}

// initialize default state (none active)
document.addEventListener('DOMContentLoaded', () => {
  const start = document.getElementById('startBtn');
  const stop = document.getElementById('stopBtn');
  if(start) start.classList.remove('active','inactive');
  if(stop) stop.classList.remove('active','inactive');
});
