'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.streamSingle = exports.streamCount = exports.index = undefined;

var _airquality = require('../../service/weather/airquality');

var airquality = _interopRequireWildcard(_airquality);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var streamClients = 0;

const index = exports.index = (() => {
    var _ref = _asyncToGenerator(function* (ctx) {
        try {
            ctx.body = yield airquality.current();
        } catch (boom) {
            ctx.body = boom.output.payload;
            ctx.status = boom.output.statusCode;
        }
    });

    return function index(_x) {
        return _ref.apply(this, arguments);
    };
})();

const streamCount = exports.streamCount = () => streamClients;

const streamSingle = exports.streamSingle = (() => {
    var _ref2 = _asyncToGenerator(function* ({ emit, disconnect }) {
        streamClients++;
        var res = airquality.fireHose(function (data) {
            emit(data);
        });

        disconnect(function () {
            streamClients--;
            res.off();
        });
    });

    return function streamSingle(_x2) {
        return _ref2.apply(this, arguments);
    };
})();