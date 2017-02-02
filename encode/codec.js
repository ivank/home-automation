const fp = require('lodash/fp/fp');

const INTRO = [3500, 1750];
const END = [PULSE];
const GAP = [PULSE, 9900];
const ONE = [PULSE, 1300];
const ZERO = [PULSE, 435];

function toTiming (code) {
	return code === 0 ? ZERO : ONE;
}

module.exports = {
	encode: function encode(introduction, control) {
		const introductionTimings = fp.map(toTiming, introduction);
		const controlTimings = fp.map(toTiming, control);

		return fp.flatten(fp.concat(INTRO, introductionTimings, GAP, INTRO, controlTimings, END));
	},
}
