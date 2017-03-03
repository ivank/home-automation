const acControlPanasonic = require('ac-control-panasonic');
const Sensor = require('sparkfun-si7021');
const sensor = new Sensor();

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const Characteristic = homebridge.hap.Characteristic;
    const Service = homebridge.hap.Service;

    const information = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Panasonic')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, 'A75C3077');

    const thermostat = new Service.Thermostat('AC');

    function update () {
        const state = thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState).value;
        const temprature = thermostat.getCharacteristic(Characteristic.TargetTemperature).value;

        acControlPanasonic({
            off: state === Characteristic.TargetHeatingCoolingState.OFF,
            state: state === Characteristic.TargetHeatingCoolingState.OFF ? null : state,
            temprature: temprature,
        });
    }

    thermostat.getCharacteristic(Characteristic.TargetTemperature).setProps({ maxValue: 30 }).on('change', update);
    thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState).on('change', update);
    thermostat.getCharacteristic(Characteristic.CurrentTemperature).on('get', (callback) => { sensor.temprature(callback) });

    return {
        getServices: function () {
            return [information, thermostat];
        },
    };
}
