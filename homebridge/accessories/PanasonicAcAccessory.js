const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const service = new homebridge.hap.Service.HeaterCooler('Panasonic AC');

    function update () {
        const isActive = service.getCharacteristic(homebridge.hap.Characteristic.Active).value;
        const isActiveFlag = isActive ? '-x' : '';
        logger(`toggle active!! ${isActive}`);

        child_process.exec(`sudo ~/homebridge-automation/control/control ${isActiveFlag}`, function (error, stdout) {
            logger(`stdout!! ${stdout}`);
        });
    }

    service.getCharacteristic(homebridge.hap.Characteristic.Active).on('change', update);

    return {
        getServices: function () {
            [service],
        },
    };
}