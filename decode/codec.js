const chunk = require('lodash/fp/chunk');
const map = require('lodash/fp/map');
const inRange = require('lodash/fp/inRange');
const findKey = require('lodash/fp/findKey');
const concat = require('lodash/fp/concat');
const flatten = require('lodash/fp/flatten');
const every = require('lodash/fp/every').convert({ 'cap': false });

const PULSE = 450;
const ITEMS = {
	"intro\n": [3500, 1700],
	"gap\n": [PULSE, 9900],
	1: [PULSE, 1250],
	0: [PULSE, 400],
	"\nend": [PULSE, 0],
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
