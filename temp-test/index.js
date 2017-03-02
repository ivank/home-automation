var i2c = require('i2c');
var crc = require('crc');
var address = 0x40;
var wire = new i2c(address, {device: '/dev/i2c-1'}); // point to your i2c address, debug provides REPL interface 
 
wire.readBytes(0xE3, 3, function (err, data) {

    var msb = data[0];
    var lsb = data[1];

    var tempData = (msb << 8) | (lsb & 0xFC);

    var temp = (-46.85 + (175.72 * tempData / 65536));
    console.log(temp);
});
