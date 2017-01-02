import request  from 'request-promise-native';
import fuzzy    from 'fuzzy';
import config   from '../../config';
import distance from '../../helper/distance';
import inbox    from '../../helper/inbox';
var cron = require('node-cron');

var stopPoints = [];
var fuzzyOptions = {
    extract: function(obj) { return obj.name; }
};

const getRaw = async () => {
    return await request(config('MOBILITEIT_STOPPOINTS', true));
};

cron.schedule(config('MOBILITEIT_REFRESH_CRON', true), function(){
    loadStoppoints();
});

const loadStoppoints = async () => {
    stopPoints = await load();
};

export const load = async () => {
    var raw = await getRaw();
    var rawStopPoints = raw.trim().split('\n');
    var newStopPoints = [];

    for (var i = 0; i < rawStopPoints.length; i++) {
        var paramParts = rawStopPoints[i].split('@');
        var params = {};
        for (var j = 0; j < paramParts.length; j++) {
            var keyVal = paramParts[j].split('=', 2);
            params[keyVal[0]] = keyVal[1];
        }
        newStopPoints.push({
            id: parseInt(params.L, 10),
            name: params.O,
            position: {
                longitude: parseFloat(params.X.replace(',', '.')),
                latitude: parseFloat(params.Y.replace(',', '.'))
            }
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
    var rawData = await request(config('MOBILITEIT_DEPARTURE', true) + stopPoint);
    var departures = [];
    var rawDepartures = JSON.parse(rawData).Departure;
    if (rawDepartures) {
        for (var i = 0; i < rawDepartures.length; i++) {
            var departure = {};
            switch (rawDepartures[i].Product.catCode) {
            case '2':
                departure.type = 'train';
                break;
            case '5':
                departure.type = 'bus';
                break;
            default:
                departure.type = 'unknown';
                break;
            }
            departure.line = rawDepartures[i].Product.line.trim();
            departure.number = parseInt(rawDepartures[i].Product.num.trim(), 10);

            var time = Math.round(Date.parse(rawDepartures[i].date + ' ' + rawDepartures[i].time) / 1000);
            if (rawDepartures[i].rtDate) {
                var realTime = Math.round(Date.parse(rawDepartures[i].rtDate + ' ' + rawDepartures[i].rtTime) / 1000);
                departure.departure = realTime;
                departure.delay = realTime - time;
                departure.live = true;
            } else {
                departure.departure = time;
                departure.delay = 0;
                departure.live = false;
            }
            departure.destination = rawDepartures[i].direction;
            departures.push(departure);
        }
    }
    return departures;
};

export const around = async (lon, lat, radius) => {
    await cache();
    var dist = 0;
    var stopPointsAround = [];

    for (var i = 0; i < stopPoints.length; i++) {
        dist = distance(
            parseFloat(lon),
            parseFloat(lat),
            stopPoints[i].longitude,
            stopPoints[i].latitude
        );

        if (dist <= radius) {
            var temp = stopPoints[i];
            temp.distance = parseFloat(dist.toFixed(2));
            stopPointsAround.push(temp);
        }
    }
    return stopPointsAround;
};

export const box = async (swlon, swlat, nelon, nelat) => {
    await cache();
    return stopPoints.filter(function(stopPoint) {
        return inbox(
            swlon, swlat, nelon, nelat,
            stopPoint.longitude,
            stopPoint.latitude
        );
    });
};

export const search = async searchString => {
    await cache();

    var results = fuzzy.filter(searchString, stopPoints, fuzzyOptions);
    return results.map(function(res) { return res.original; });
};
