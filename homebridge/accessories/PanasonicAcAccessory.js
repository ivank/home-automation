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
    let heatingThreshold = 25;
    let coolingThreshold = 20;

    function update () {
        const controlState = {};

        const state = thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState).value;
        const temprature = thermostat.getCharacteristic(Characteristic.TargetTemperature).value;
        const currentTemperature = thermostat.getCharacteristic(Characteristic.CurrentTemperature).value;

        switch (state) {
            case Characteristic.TargetHeatingCoolingState.OFF:
                controlState.off = true;
                break;
            case Characteristic.TargetHeatingCoolingState.COOL:
                controlState.mode = 'COOL';
                controlState.temprature = temprature;
                controlState.profile = 'POWERFUL';
                break;
            case Characteristic.TargetHeatingCoolingState.HEAT:
                controlState.mode = 'HEAT';
                controlState.profile = 'POWERFUL';
                controlState.temprature = temprature;
                break;
            case Characteristic.TargetHeatingCoolingState.AUTO:
                controlState.profile = 'QUIET';
                if (currentTemperature > coolingThreshold) {
                    controlState.mode = 'COOL';
                    controlState.temprature = coolingThreshold;
                } else if (currentTemperature < heatingThreshold) {
                    controlState.mode = 'HEAT';
                    controlState.temprature = heatingThreshold;
                } else {
                    controlState.mode = 'AUTO';
                }
                break;
        }

        acControlPanasonic(controlState, (err, result) => {
            if (err) {
                logger('Error: ' + err.message);
            } else {
                logger('Updated temprature ' + JSON.stringify(controlState));
            }
        });
    }

    thermostat
        .getCharacteristic(Characteristic.TargetTemperature)
        .setProps({ maxValue: 30 })
        .on('change', update);

    thermostat
        .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on('change', update);

    thermostat
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', function (callback) { sensor.temprature(callback) });

    thermostat
        .getCharacteristic(Characteristic.HeatingThresholdTemperature)
        .on('get', function (callback) { callback(null, heatingThreshold) })
        .on('set', function (data) { logger(data); heatingThreshold = data.newValue });

    thermostat
        .getCharacteristic(Characteristic.CoolingThresholdTemperature)
        .on('get', function (callback) { callback(null, coolingThreshold) })
        .on('set', function (data) { logger(data); coolingThreshold = data.newValue });

    return {
        getServices: function () {
            return [information, thermostat];
        },
    };
}
