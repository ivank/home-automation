"use strict";

const child_process = require('child_process');
const path = require('path');

const AUTO = 'AUTO';
const COOL = 'COOL';
const HEAT = 'HEAT';
const DRY = 'DRY';
const POWERFUL = 'POWERFUL';
const QUIET = 'QUIET';
const modes = [AUTO, COOL, HEAT, DRY];
const profiles = [POWERFUL, QUIET];

function validate(state) {
    if (state.mode && !modes.includes(state.mode)) {
        throw new Error('Mode ' + state.mode + ' is not a valid mode');
    }

    if (state.profile && !profiles.includes(state.profile)) {
        throw new Error('Profile ' + state.profile + ' is not a valid profile');
    }

    if (state.temprature && state.temprature < 16 || state.temprature > 30) {
        throw new Error('Temprature ' + state.temprature + ' is not a valid (16-30)');
    }
}

function stateToFlags(state) {
    const flags = [];

    validate(state);

    if (state.off) {
        flags.push('-x');
    } else {
        if (state.mode) {
            flags.push('-m ' + state.mode);
        }
        if (state.temprature) {
            flags.push('-t ' + state.temprature);
        }
        if (state.profile === POWERFUL) {
            flags.push('-p');
        } else if (state.profile === QUIET) {
            flags.push('-q');
        }
    }

    return flags.join(' ');
}

function control (state, callback) {
    const flags = stateToFlags(state);
    const binaryPath = path.resolve(__dirname, '../control');

    child_process.exec('sudo ' + binaryPath + ' ' + flags, callback);
}

control.stateToFlags = stateToFlags;
control.validate = validate;

control.AUTO = AUTO;
control.COOL = COOL;
control.HEAT = HEAT;
control.DRY = DRY;
control.POWERFUL = POWERFUL;
control.QUIET = QUIET;

module.exports = control;
