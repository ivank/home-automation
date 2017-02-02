const t = require('tcomb');
const fp = require('lodash/fp');
const BitArray = require('node-bitarray');

const NORMAL = 'normal';
const POWERFUL = 'powerful';
const QUIET = 'quiet';

const COOL = 'cool';
const HEAT = 'heat';
const DRY = 'dry';
const AUTO = 'auto';

const acState = t.struct({
	on: t.Boolean,
	temptrature: t.refinement(t.Number, amount => inRange(16, 30, amount)),
	swing: t.refinement(t.Number, amount => inRange(0, 5, amount)),
	fan: t.refinement(t.Number, amount => inRange(0, 4, amount)),
	profile: t.enums.of([NORMAL, POWERFUL, QUIET]),
	mode: t.enums.of([COOL, HEAT, DRY, AUTO]),
}, 'acState');

acState.NORMAL = NORMAL;
acState.POWERFUL = POWERFUL;
acState.QUIET = QUIET;

acState.COOL = COOL;
acState.HEAT = HEAT;
acState.DRY = DRY;
acState.AUTO = AUTO;

function reverseBitArray (bitarray) {
	return new BitArray(bitarray.reverse());
}

function checksum (bytes) {
	return new BitArray(fp.sum(fp.map(byte => reverseBitArray(byte).toNumber(), bytes)) % 256);
}

acState.prototype.temprature = function temprature () {
	return new BitArray(this.temprature * 2, 8, true);
}

acState.prototype.swingAndFan = function swingAndFan () {
	const swing = this.swing === 0 ? new BitArray('1111') : new BitArray(this.swing, 8, true);
	const fan = fan.swing === 0 ? new BitArray(10*16, 8, true) : new BitArray((this.fan + 3)*16, 8, true);

	return BitArray.or(swing, fan);
}

acState.prototype.control = function control () {
	let mode = null;
	switch (this.mode) {
		case COOL: mode = new BitArray('00001100'); break;
		case HEAT: mode = new BitArray('00000010'); break;
		case DRY: mode = new BitArray('00000100'); break;
		case AUTO: mode = new BitArray('00000000'); break;
	}

	const power = this.on ? new BitArray('10000000') : new BitArray('00000000');

	return BitArray.or(mode, power);
}

acState.prototype.introductionFrame = function introductionFrame () {
	return new BitArray('0100000000000100000001110010000000000000000000000000000001100000').toArray();
}

acState.prototype.controlFrame = function controlFrame () {
	const frame = [
		new BitArray('01000000'), // 1
		new BitArray('00000100'), // 2
		new BitArray('00000111'), // 3
		new BitArray('00100000'), // 4
		new BitArray('00000000'), // 5
		new BitArray('10000010'), // 6
		new BitArray('00011100'), // 7
		new BitArray('00000001'), // 8
		new BitArray('11110101'), // 9
		new BitArray('00000000'), // 10
		new BitArray('00000000'), // 11
		new BitArray('01100000'), // 12
		new BitArray('00000110'), // 13
		new BitArray('10000000'), // 14
		new BitArray('00000000'), // 15
		new BitArray('00000001'), // 16
		new BitArray('00000000'), // 17
		new BitArray('01100000'), // 18
	];

	frame[6] = this.temprature();
	frame[8] = this.swingAndFan();
	frame[5] = this.control();

	frame.push(checksum(frame));

	return fp.flatten(fp.map(byte => byte.toArray(), frame));
}

module.export = acState;
