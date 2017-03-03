
const DEFAULT_ADDRESS = 0x40;
const DEFAULT_DEVICE = '/dev/i2c-1';

class Sensor {
    constructor({ address, device, wire }) {
        if (wire) {
            this.wire = wire;
        } else {
            const i2c = require('i2c');
            this.wire = new i2c(address || DEFAULT_ADDRESS, { device: device || DEFAULT_DEVICE });
        }
    }

    temprature (callback) {
        this.wire.readBytes(0xE3, 3, function (err, data) {
            if (err) {
                callback(err);
            } else {
                const msb = data[0];
                const lsb = data[1];
                const tempData = (msb << 8) | (lsb & 0xFC);
                const temp = (-46.85 + (175.72 * tempData / 65536));

                callback (null, temp);
            }
        });
    }
}

module.exports = Sensor;