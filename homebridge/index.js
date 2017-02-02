"use strict";

const PanasonicAc = require('./accessories/PanasonicAcAccessory');

module.exports = function (homebridge) {
    homebridge.registerAccessory("homebridge-panasonic-ac", "Panasonic AC", function (logger, config) {
        PanasonicAc(homebridge, logger, config);
    });
}