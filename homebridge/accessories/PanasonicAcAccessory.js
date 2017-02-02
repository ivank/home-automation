const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const power = new homebridge.hap.Service.Switch()
        .setCharacteristic(homebridge.hap.Characteristic.Name, 'AC Power');

    const information = new homebridge.hap.Service.AccessoryInformation()
        .setCharacteristic(homebridge.hap.Characteristic.Name, config.name)
        .setCharacteristic(homebridge.hap.Characteristic.Manufacturer, 'Panasonic')
        .setCharacteristic(homebridge.hap.Characteristic.Model, '1.0.0')
        .setCharacteristic(homebridge.hap.Characteristic.SerialNumber, 'A75C3077');

    const thermostat = new homebridge.hap.Service.Thermostat('Panasonic AC');

    function update () {
        const isActive = power.getCharacteristic(homebridge.hap.Characteristic.On).value;
        const isActiveFlag = isActive ? '' : '-x';

        child_process.exec(`sudo ~/home-automation/control/control ${isActiveFlag}`, function (error, stdout, stderr) {
            console.log(error);
            console.log(stderr);
            logger(`stdout!! ${stdout}`);
        });
    }

    power.getCharacteristic(homebridge.hap.Characteristic.On).on('change', update);

    return {
        name: config.name,

        identify: function (callback) {
            logger('IDENTIFIED');
            callback(null);
        },

        getServices: function () {
            return [power, information, thermostat];
        },
    };
}
