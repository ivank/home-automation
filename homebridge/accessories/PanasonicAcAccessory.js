const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const accessory = new homebridge.hap.Accessory('Panasonic AC', homebridge.hap.uuid.generate('ivank:panasonic:ac'));
    const service = new homebridge.Services.HeaterCooler('Panasonic AC');

    function update () {
        const isActive = service.getCharacteristic(homebridge.hap.Characteristic.Active).value;
        const isActiveFlag = isActive ? '-x' : '';
        logger(`toggle active!! ${isActive}`);

        child_process.exec(`sudo ~/homebridge-automation/control/control ${isActiveFlag}`, function (error, stdout) {
            logger(`stdout!! ${stdout}`);
        });
    }

    service.getCharacteristic(homebridge.hap.Characteristic.Active).on('change', update);

    accessory.addService(service);

    return accessory;
}