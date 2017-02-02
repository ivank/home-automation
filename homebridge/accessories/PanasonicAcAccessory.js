const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const information = new homebridge.hap.Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Name, config.name)
        .setCharacteristic(Characteristic.Manufacturer, 'Panasonic')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, 'A75C3077');

    const control = new homebridge.hap.Service.HeaterCooler('Panasonic AC');

    function update () {
        const isActive = control.getCharacteristic(homebridge.hap.Characteristic.Active).value;
        const isActiveFlag = isActive ? '-x' : '';
        logger(`toggle active!! ${isActive}`);

        child_process.exec(`sudo ~/homebridge-automation/control/control ${isActiveFlag}`, function (error, stdout) {
            logger(`stdout!! ${stdout}`);
        });
    }

    control.getCharacteristic(homebridge.hap.Characteristic.Active).on('change', update);

    return {
        name: config.name,

        identify: function (callback) {
            logger('IDENTIFIED');
            callback(null);
        },

        getServices: function () {
            return [information, control];
        },
    };
}