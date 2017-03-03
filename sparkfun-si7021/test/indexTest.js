'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Sensor = require('../src');

describe('Sensor', function () {
    it('Should return correct temprature', function (done) {
        const data = Buffer.from([97, 232, 217]);
        const readBytes = sinon.stub().callsArgWith(2, null, data);
        const sensor = new Sensor({ wire: { readBytes } });

        sensor.temprature(function (err, temprature) {
            assert.equal(temprature, 20.3534619140625);
            done();
        });
    });

    it('Should return correct humidity', function (done) {
        const data = Buffer.from([0x5e, 0xf2, 0x6a]);
        const readBytes = sinon.stub().callsArgWith(2, null, data);
        const sensor = new Sensor({ wire: { readBytes } });

        sensor.humidity(function (err, humidity) {
            assert.equal(humidity, 0.40356201171875);
            done();
        });
    });
});
