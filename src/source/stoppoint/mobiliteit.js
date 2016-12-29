import request from 'request-promise-native';
var cron = require('node-cron');

var stopPoints = [];

const getRaw = () => {
    return request('http://travelplanner.mobiliteit.lu/hafas/query.exe/dot?performLocating=2&tpl=stop2csv&look_maxdist=150000&look_x=6112550&look_y=49610700&stationProxy=yes');
};

cron.schedule('0 15 5 * * *', function(){
    loadStoppoints();
});

const loadStoppoints = async () => {
    console.log('loading mobiliteit');
    stopPoints = await load();
};

export const load = async () => {

    var raw = await getRaw();
    var stations = raw.trim().split('\n');
    var newStopPoints = [];

    for (var i = 0; i < stations.length; i++) {
        var paramParts = stations[i].split('@');
        var params = {};
        for (var j = 0; j < paramParts.length; j++) {
            var keyVal = paramParts[j].split('=', 2);
            params[keyVal[0]] = keyVal[1];
        }
        newStopPoints.push({
            id: parseInt(params.L, 10),
            name: params.O,
            longitude: parseFloat(params.X.replace(',', '.')),
            latitude: parseFloat(params.Y.replace(',', '.'))
        });
    }

    return newStopPoints;

};

const cache = async () => {
    if (stopPoints.length === 0) {
        await loadStoppoints();
    }
};

export const all = async () => {
    await cache();
    return stopPoints;
};

export const get = async stopPoint => {
    await cache();
    for (var i = 0; i < stopPoints.length; i++) {
        if (stopPoints[i].id == stopPoint) {
            return stopPoints[i];
        }
    }
    return false;
};
