const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const Characteristic = homebridge.hap.Characteristic;
    const Service = homebridge.hap.Service;

    const information = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Panasonic')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, 'A75C3077');

    const thermostat = new Service.Thermostat('Panasonic AC').setCharacteristic(Characteristic.Name, 'Panasonic AC');

    const targetTemprature = thermostat.getCharacteristic(Characteristic.TargetTemperature).setProps({ minValue: 16, maxValue: 30 });
    const targetState = thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState);

    function update () {
        const state = targetState.getValue();
        const temprature = targetTemprature.getValue();

        let powerFlag = '';
        let modeFlag = '';

        if (state === Characteristic.TargetHeatingCoolingState.OFF) {
            powerFlag = '-x';
        } else if (state === Characteristic.TargetHeatingCoolingState.AUTO) {
            modeFlag = '-m AUTO';
        } else if (state === Characteristic.TargetHeatingCoolingState.COOL) {
            modeFlag = '-m COOL';
        } else if (state === Characteristic.TargetHeatingCoolingState.HEAT) {
            modeFlag = '-m HEAT';
        }

        const tempratureFlag = '-t ' + temprature;

        child_process.exec(`sudo ~/home-automation/control/control ${powerFlag} ${modeFlag} ${tempratureFlag}`, function (error, stdout, stderr) {
            console.log(error);
            console.log(stderr);
            logger(`stdout!! ${stdout}`);
        });
    }

    targetTemprature.on('change', update);
    targetState.on('change', update);

    return {
        getServices: function () {
            return [information, thermostat];
        },
    };
}
