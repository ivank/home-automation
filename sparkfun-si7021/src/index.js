
const DEFAULT_ADDRESS = 0x40;
const DEFAULT_DEVICE = '/dev/i2c-1';

class Sensor {
    constructor(config) {
        if (config && config.wire) {
            this.wire = config.wire;
        } else {
            const i2c = require('i2c');
            this.wire = new i2c(
                config && config.address || DEFAULT_ADDRESS, {
                    device: config && config.device || DEFAULT_DEVICE
                }
            );
        }
    }

    temprature (callback) {
        this.wire.readBytes(0xE3, 3, function (err, data) {
            if (err) {
                callback(err);
            } else {
                const msb = data[0];
                const lsb = data[1];
                const data16 = (msb << 8) | (lsb & 0xFC);
                const temp = (-46.85 + (175.72 * data16 / 65536));

                callback (null, temp);
            }
        });
    }

    humidity (callback) {
        this.wire.readBytes(0xE5, 3, function (err, data) {
            if (err) {
                callback(err);
            } else {
                const msb = data[0];
                const lsb = data[1];
                const data16 = (msb << 8) | (lsb & 0xFC);
                const humidity = (-6 + (125 * data16 / 65536)) / 100;

                callback (null, humidity);
            }
        });
    }
}

module.exports = Sensor;