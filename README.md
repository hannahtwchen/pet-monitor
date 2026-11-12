# PawWatch Pet Monitor

A rough interactive model for a pet monitor. Open `index.html` in a browser.

## States represented

- **Device mode:** off, monitoring, talking
- **Pet activity:** unknown, active, resting

The buttons provide simulated events: turning the device on/off, detecting movement, detecting no movement, and talking through the speaker while the button is held down.

## Avoiding unnecessary alerts

The monitor does not assume that long inactivity is automatically an emergency. The owner enters a **check-in threshold** in minutes. After that amount of real time without detected movement, the screen creates a gentle check-in prompt rather than an emergency claim. Movement alone cannot prove whether a pet needs help, so the device gives the owner context instead of making a frightening assumption.
