// These variables represent the monitor's current state.
let deviceMode = "monitoring"; // "off", "monitoring", or "talking"
let petActivity = "resting"; // "unknown", "active", or "resting"
let lastMovement = null;
let stillSince = Date.now();

const powerButton = document.querySelector("#power-button");
const movementButton = document.querySelector("#movement-button");
const restButton = document.querySelector("#rest-button");
const talkButton = document.querySelector("#talk-button");
const powerLight = document.querySelector("#power-light");
const deviceStatus = document.querySelector("#device-status");
const petStatus = document.querySelector("#pet-status");
const detail = document.querySelector("#detail");
const activityTime = document.querySelector("#activity-time");
const alertMessage = document.querySelector("#alert-message");
const thresholdSelect = document.querySelector("#alert-threshold");
const countdown = document.querySelector("#countdown");
const screen = document.querySelector(".screen");
const petIcon = document.querySelector(".pet-icon");

function getMinutesStill() {
  if (!stillSince) return 0;
  return Math.floor((Date.now() - stillSince) / 60000);
}

function getCountdown() {
  const thresholdMs = (Number(thresholdSelect.value) || 30) * 60000;
  const remainingMs = Math.max(0, thresholdMs - (stillSince ? Date.now() - stillSince : 0));
  const wholeSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateScreen() {
  document.querySelector("#mode-value").textContent = deviceMode;
  document.querySelector("#activity-value").textContent = petActivity;
  document.querySelector("#movement-value").textContent = lastMovement || "—";
  const minutesStill = getMinutesStill();
  document.querySelector("#still-time-value").textContent = `${minutesStill} min`;

  const isOn = deviceMode !== "off";
  movementButton.disabled = !isOn || deviceMode === "talking";
  restButton.disabled = !isOn || deviceMode === "talking";
  talkButton.disabled = !isOn;
  screen.classList.toggle("talking-screen", deviceMode === "talking");

  if (deviceMode === "off") {
    powerLight.className = "indicator off";
    deviceStatus.textContent = "Device is off";
    petStatus.textContent = "Waiting to monitor";
    detail.textContent = "Turn PawWatch on to start checking for activity.";
    activityTime.textContent = "No activity recorded";
    alertMessage.textContent = "";
    countdown.textContent = "Check-in paused";
    petIcon.textContent = "🐾";
  } else if (deviceMode === "talking") {
    powerLight.className = "indicator talking";
    deviceStatus.textContent = "Talking through speaker";
    petStatus.textContent = "Message playing";
    detail.textContent = "Hi buddy! I will be home soon.";
    activityTime.textContent = "The monitor will return to monitoring when the message ends.";
    alertMessage.textContent = "";
    countdown.textContent = "Check-in paused";
    petIcon.textContent = "🔊";
    talkButton.textContent = "Talking... release to stop";
  } else if (petActivity === "active") {
    powerLight.className = "indicator on";
    deviceStatus.textContent = "Monitoring";
    petStatus.textContent = "Pet is active";
    detail.textContent = "Movement was detected. Your pet may be playing or exploring.";
    activityTime.textContent = `Last movement: ${lastMovement}`;
    alertMessage.textContent = "";
    countdown.textContent = "Check-in paused";
    petIcon.textContent = "🐾";
    talkButton.textContent = "Talk to Pet (press to talk)";
  } else {
    powerLight.className = "indicator on";
    deviceStatus.textContent = "Monitoring";
    petStatus.textContent = "Pet is resting";
    detail.textContent = "No movement was detected for a while. Your pet may be sleeping.";
    activityTime.textContent = lastMovement ? `Last movement: ${lastMovement}` : "No movement recorded yet";
    const threshold = Number(thresholdSelect.value) || 30;
    if (minutesStill >= threshold) {
      alertMessage.textContent = `Check-in: no movement for ${minutesStill} minutes. This is a gentle prompt, not an emergency alert.`;
    } else alertMessage.textContent = "";
    countdown.textContent = `Check-in in ${getCountdown()}`;
    petIcon.textContent = "🐾";
    talkButton.textContent = "Talk to Pet (press to talk)";
  }
}

powerButton.addEventListener("click", () => {
  if (deviceMode === "off") {
    deviceMode = "monitoring";
    petActivity = "resting";
    stillSince = Date.now();
    powerButton.textContent = "Turn Off";
  } else {
    deviceMode = "off";
    petActivity = "unknown";
    stillSince = null;
    powerButton.textContent = "Turn On";
  }
  updateScreen();
});

// The monitor is already on when the page opens.
powerButton.textContent = "Turn Off";

movementButton.addEventListener("click", () => {
  petActivity = "active";
  stillSince = null;
  lastMovement = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  updateScreen();
});

restButton.addEventListener("click", () => {
  petActivity = "resting";
  if (!stillSince) stillSince = Date.now();
  updateScreen();
});

thresholdSelect.addEventListener("input", updateScreen);

function startTalking() {
  if (deviceMode !== "monitoring") return;
  deviceMode = "talking";
  updateScreen();
}

function stopTalking() {
  if (deviceMode === "talking") {
    deviceMode = "monitoring";
    updateScreen();
  }
}

// Pointer events cover mouse and touch. Keyboard support gives the same press/release behavior.
talkButton.addEventListener("pointerdown", startTalking);
talkButton.addEventListener("pointerup", stopTalking);
talkButton.addEventListener("pointerleave", stopTalking);
talkButton.addEventListener("pointercancel", stopTalking);
talkButton.addEventListener("keydown", (event) => {
  if ((event.key === " " || event.key === "Enter") && !event.repeat) startTalking();
});
talkButton.addEventListener("keyup", (event) => {
  if (event.key === " " || event.key === "Enter") stopTalking();
});

// Refresh the displayed duration and alert when time passes.
window.setInterval(updateScreen, 1000);

updateScreen();
