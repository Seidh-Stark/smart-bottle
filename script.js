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
