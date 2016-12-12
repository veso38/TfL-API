import request from 'request-promise-native';

const getRaw = () => request('https://api.jcdecaux.com/vls/v1/stations?contract=Luxembourg&apiKey=1835af14f29db63b765a3335ba42891323ce8f12');

export const get = async () => {
    var raw = await getRaw();
    return JSON.parse(raw);
};

export const stations = async () => {
    var stations = await get();
    return stations.map(compileStation);
};

export const compileStation = station => {

    var dock_status = [];

    for (var i = 1; i <= station.available_bikes; i++) {
        dock_status.push({
            status:   'occupied',
            bikeType: 'manual'
        });
    }

    for (i = 1; i <= station.available_bike_stands; i++) {
        dock_status.push({
            status:   'free',
            bikeType: null
        });
    }

    return {
        id: station.number,
        open: station.status == 'OPEN',
        name: station.name,
        position: {
            longitude:      parseFloat(station.position.lat),
            latitude:       parseFloat(station.position.lng)
        },
        city: null,
        address: station.address,
        photo: null,
        docks: parseInt(station.bike_stands),
        available_bikes: parseInt(station.available_bikes),
        available_ebikes: null,
        available_docks: parseInt(station.available_bike_stands),
        last_update: station.last_update,
        dock_status: dock_status
    };
};