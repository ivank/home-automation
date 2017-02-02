const child_process = require('child_process');

module.exports = function PanasonicAcAccessory (homebridge, logger, config) {
    const Characteristic = homebridge.hap.Characteristic;
    const Service = homebridge.hap.Service;

    const information = new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Manufacturer, 'Panasonic')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, 'A75C3077');

    const thermostat = new Service.Thermostat('Panasonic AC').setCharacteristic(Characteristic.Name, 'Panasonic AC');
    thermostat.getCharacteristic(Characteristic.TargetTemperature)
        .setProps({ value: 25 })
        .setProps({ minValue: 16, maxValue: 30 });

    function update () {
        const state = thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState).value;
        const temprature = thermostat.getCharacteristic(Characteristic.TargetTemperature).value;

        let powerFlag = '';
        let modeFlag = '';
        let profileFlag = '';

        if (state === Characteristic.TargetHeatingCoolingState.OFF) {
            powerFlag = '-x';
        } else if (state === Characteristic.TargetHeatingCoolingState.AUTO) {
            modeFlag = '-m AUTO';
        } else if (state === Characteristic.TargetHeatingCoolingState.COOL) {
            modeFlag = '-m COOL';
            profileFlag = '-p';
        } else if (state === Characteristic.TargetHeatingCoolingState.HEAT) {
            modeFlag = '-m HEAT';
            profileFlag = '-p';
        }

        const tempratureFlag = '-t ' + temprature;

        child_process.exec(`sudo ~/home-automation/control/control ${powerFlag} ${profileFlag} ${modeFlag} ${tempratureFlag}`, function (error, stdout, stderr) {
            console.log(error);
            console.log(stderr);
            logger(`stdout!! ${stdout}`);
        });
    }

    thermostat.getCharacteristic(Characteristic.TargetTemperature).on('change', update);
    thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState).on('change', update);

    return {
        getServices: function () {
            return [information, thermostat];
        },
    };
}
