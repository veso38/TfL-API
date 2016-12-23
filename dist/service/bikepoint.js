'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compileStation = exports.station = exports.stations = undefined;

var _velok = require('../source/bikepoint/velok');

var velok = _interopRequireWildcard(_velok);

var _veloh = require('../source/bikepoint/veloh');

var veloh = _interopRequireWildcard(_veloh);

var _requestPromiseNative = require('request-promise-native');

var _requestPromiseNative2 = _interopRequireDefault(_requestPromiseNative);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const stations = exports.stations = () => {

    const sources = {
        'velok': velok.stations(),
        'veloh': veloh.stations()
    };

    var providers = Object.keys(sources);

    return Promise.all(
    //TODO: replace when Issue #2 is closed
    Object.keys(sources).map(key => sources[key])).then(results => {

        var stations = [];

        for (let i = 0; i < results.length; i++) {
            stations = [...stations, ...results[i].map(station => compileStation(providers[i], station))];
        }

        return stations;
    });
};

const station = exports.station = (() => {
    var _ref = _asyncToGenerator(function* (bikePoint) {
        bikePoint = bikePoint.split(':');
        return yield veloh.station(bikePoint[1]);
    });

    return function station(_x) {
        return _ref.apply(this, arguments);
    };
})();

const compileStation = exports.compileStation = function (provider, station) {

    station.id = provider + ':' + station.id;

    return station;
};