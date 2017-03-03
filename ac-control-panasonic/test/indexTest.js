'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const control = require('../src');

describe('Control', function () {
    it('stateToFlags should return only off flag always', function () {
        assert.equal('-x', control.stateToFlags({ off: true }));
        assert.equal('-x', control.stateToFlags({ off: true, temprature: 30 }));
        assert.equal('-x', control.stateToFlags({ off: true, temprature: 30, mode: control.HEAT }));
    });

    it('stateToFlags should return correct mode', function () {
        assert.equal('-m AUTO', control.stateToFlags({ mode: control.AUTO }));
        assert.equal('-m HEAT', control.stateToFlags({ mode: control.HEAT }));
        assert.equal('-m COOL', control.stateToFlags({ mode: control.COOL }));
        assert.equal('-m DRY', control.stateToFlags({ mode: control.DRY }));
    });

    it('stateToFlags should return correct profile', function () {
        assert.equal('-p', control.stateToFlags({ profile: control.POWERFUL }));
        assert.equal('-q', control.stateToFlags({ profile: control.QUIET }));
    });

    it('stateToFlags should return correct temprature', function () {
        assert.equal('-t 20', control.stateToFlags({ temprature: 20 }));
        assert.equal('-t 25', control.stateToFlags({ temprature: 25 }));
        assert.equal('-t 30', control.stateToFlags({ temprature: 30 }));
    });

    it('stateToFlags should return correct flags', function () {
        assert.equal('-m HEAT -t 25 -p', control.stateToFlags({ mode: control.HEAT, profile: control.POWERFUL, temprature: 25 }));
        assert.equal('-m COOL -t 28 -q', control.stateToFlags({ mode: control.COOL, profile: control.QUIET, temprature: 28 }));
    });

    it('validate should validate temprature', function () {
        assert.throws(
            function () { control.validate({ temprature: 10 }); },
            /Temprature 10 is not a valid/
        );

        assert.throws(
            function () { control.validate({ temprature: 50 }); },
            /Temprature 50 is not a valid/
        );
    });

    it('validate should validate mode', function () {
        assert.throws(
            function () { control.validate({ mode: 'test' }); },
            /Mode test is not a valid mode/
        );
    });

    it('validate should validate profile', function () {
        assert.throws(
            function () { control.validate({ profile: 'test' }); },
            /Profile test is not a valid profile/
        );
    });

    it('should test control', function (done) {
        this.timeout(10000);

        const binFile = path.resolve(__dirname, '../control');
        const binTmpFile = path.resolve(__dirname, 'controlTest');

        if (fs.existsSync(binFile)) {
            fs.unlinkSync(binFile);
        }

        fs.symlinkSync(binTmpFile, 'control');

        control({ mode: control.HEAT, profile: control.POWERFUL, temprature: 25 }, function (err, result) {
            assert.equal(result, '-m HEAT -t 25 -p\n');

            fs.unlinkSync(binFile);

            done();
        });
    });
});
