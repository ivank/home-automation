var Gpio = require('pigpio').Gpio,
  led = new Gpio(27, {mode: Gpio.OUTPUT}),
  dutyCycle = 0,
  change = 3;

setInterval(function () {
  led.pwmWrite(dutyCycle);

  dutyCycle += change;
  if (dutyCycle > 255) {
    change = -3;
    dutyCycle = 255;
  } else if (dutyCycle < 0) {
      change = 3;
      dutyCycle = 0;
  }

}, 20);
