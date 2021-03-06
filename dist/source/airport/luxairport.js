'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.load = undefined;

var _requests = require('../../requests');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const load = exports.load = (() => {
    var _ref = _asyncToGenerator(function* () {
        var raw = yield (0, _requests.luxairportArrivalsAndDepartures)();
        return {
            departures: filterOutTakenOff(raw['departures'].map(compilePlaneInfo)),
            arrivals: filterOutArrived(raw['arrivals'].map(compilePlaneInfo))
        };
    });

    return function load() {
        return _ref.apply(this, arguments);
    };
})();

const compilePlaneInfo = plane => {
    var scheduled = (0, _moment2.default)(plane.scheduledTime, 'HH:mm').unix();
    var estimated = (0, _moment2.default)(plane.estimatedTime, 'HH:mm').unix();

    return {
        id: parseInt(plane.flight_id),
        airline: plane.airlineName,
        flight: plane.flightNumber,
        destination: plane.airportName,
        via: handleVia(plane.airportStepover),
        scheduled: scheduled,
        real: estimated,
        status: handleStatus(plane.remarks),
        statusCode: parseInt(plane.statusCode)
    };
};

const handleVia = via => {
    if (via == '') {
        return null;
    }
    return via;
};

const handleStatus = status => {
    if (status == '') {
        return null;
    }
    return status;
};

const filterOutTakenOff = planes => {
    planes = planes.filter(plane => {
        if (plane.statusCode == 10) {
            return false;
        }
        return true;
    });
    return sortByExpectedTime(planes);
};

const filterOutArrived = planes => {
    planes = planes.filter(plane => {
        if (plane.statusCode == 13) {
            return false;
        }
        return true;
    });
    return sortByExpectedTime(planes);
};

const sortByExpectedTime = planes => {
    planes.sort((a, b) => a.scheduled - b.scheduled);
    return planes;
};