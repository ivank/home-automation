"use strict";

const PanasonicAcAccessory = require('./accessories/PanasonicAcAccessory');

module.exports = function (homebridge) {
    homebridge.registerAccessory("homebridge-home-automation", "Panasonic AC", function (logger, config) {
        return PanasonicAcAccessory(homebridge, logger, config);
    });
}
