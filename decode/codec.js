const chunk = require('lodash/fp/chunk');
const map = require('lodash/fp/map');
const inRange = require('lodash/fp/inRange');
const findKey = require('lodash/fp/findKey');
const concat = require('lodash/fp/concat');
const flatten = require('lodash/fp/flatten');
const every = require('lodash/fp/every').convert({ 'cap': false });

const PULSE = 450;
const ITEMS = {
	"\nintro\n": [3500, 1750],
	"\ngap\n": [PULSE, 9900],
	1: [PULSE, 1300],
	0: [PULSE, 435],
	"\nend\n": [PULSE, 0],
};

function fuzzyEquals (to, tolerance, what) {
	return inRange(to - tolerance, to + tolerance, what);
}

function pairFuzzyEquals(to, what) {
	const TOLERANCE = 200;
	return to.length === what.length && every((toPart, index) => fuzzyEquals(toPart, TOLERANCE, what[index]), to);
}

function decodePair (pair) {
	return findKey(item => pairFuzzyEquals(pair, item), ITEMS);
}

function encodePair (pair) {
	return ITEMS[pair];
}

module.exports = {
	decode: function decode(codes) {
		const pairs = chunk(2, codes);
		return map(pair => decodePair(pair), pairs);
	},
	encode: function encode(pairs) {
		return flatten(map(pair => encodePair(pair), pairs));
	},
}
