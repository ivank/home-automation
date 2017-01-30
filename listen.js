var gpio = require('rpi-gpio');
var values = [];
var time = null;
var timeout = null;

gpio.on('change', function (channel, value) {
	// if (time) {
	// 	time = process.hrtime(time);
	// 	values[[value, time[0]*1000]];
	// } else {
	// 	var time = process.hrtime();
	// }
	// if (!timeout) {
	// 	timeout = setTimeout(function () {
	// 		console.log(values);
	// 	}, 1000);
	// }
    console.log('Channel ' + channel + ' value is now ' + value);
});
gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH);
