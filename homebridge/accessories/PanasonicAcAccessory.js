const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger) {
    homebridge.Accessory.call(this, 'Panasonic AC', 'a020ae78-4611-4a44-b1cd-741fb74741aa');

    this.service = new homebridge.Services.HeaterCooler('Panasonic AC');

    this.service.getCharacteristic(homebridge.Characteristic.Active).on('change', () => this.update(homebridge, logger));
    this.addService(this.service);
}

PanasonicAcAccessory.prototype.update = function update (homebridge, logger) {
    const isActive = this.getCharacteristic(homebridge.Characteristic.Active).value;
    const isActiveFlag = isActive ? '-x' : '';
    logger(`toggle active!! ${isActive}`);

    child_process.exec(`sudo ~/homebridge-automation/control/control ${isActiveFlag}`, function (error, stdout) {
        logger(`stdout!! ${stdout}`);
    });
}