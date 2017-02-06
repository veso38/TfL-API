import { Server }     from 'http';
import Koa            from 'koa';
import KoaRouter      from 'koa-router';
import Stream         from './stream';
import controller     from './controller';
import { middleware } from './monitor';
import monitor        from './monitor';
import config         from './config';
import Influx         from 'influxdb-nodejs';

const app    = new Koa();
const router = new KoaRouter();

router.use(middleware.routeAccess(router));

router.get('/',                                          controller.home.index);
router.get('/BikePoint',                                 controller.bikepoint.index);
router.io ('/BikePoint',                                 controller.bikepoint.streamIndex);
router.get('/BikePoint/:bikePoint',                      controller.bikepoint.get);
router.get('/BikePoint/around/:lon/:lat/:radius',        controller.bikepoint.around);
router.get('/BikePoint/box/:swlon/:swlat/:nelon/:nelat', controller.bikepoint.box);
router.get('/BikePoint/search/:searchstring',            controller.bikepoint.search);
router.get('/Occupancy/CarPark',                         controller.carpark.index);
router.get('/Occupancy/CarPark/:carPark',                controller.carpark.get);
router.get('/StopPoint',                                 controller.stoppoint.index);
router.io ('/StopPoint',                                 controller.stoppoint.streamIndex);
router.get('/StopPoint/:stopPoint',                      controller.stoppoint.get);
router.get('/StopPoint/around/:lon/:lat/:radius',        controller.stoppoint.around);
router.get('/StopPoint/box/:swlon/:swlat/:nelon/:nelat', controller.stoppoint.box);
router.get('/StopPoint/search/:searchstring',            controller.stoppoint.search);
router.io ('/StopPoint/Departures',                      controller.departures.streamIndex);
router.get('/StopPoint/Departures/:stopPoint',           controller.departures.get);
router.get('/StopPoint/Departures/:stopPoint/:limit',    controller.departures.load);
router.get('/Journey/:from/to/:to',                      controller.journey.plan);
router.get('/Weather',                                   controller.weather.current);

app.use(monitor())
   .use(middleware.responseTime())
   .use(router.routes())
   .use(router.allowedMethods());

const server = Server(app.callback());
Stream.bind(server, router);

const PORT = config('SERVER_PORT', true);
if (PORT) {
    server.listen(PORT);
}

var influxdb = false;

const streamCountToInflux = () => {
    influxdb.write('streamConnections')
        .field({
            departures: controller.departures.streamCount(),
            bikepoint:  controller.bikepoint.streamCount()
        })
        .then();
    return;
};

if (config('INFLUXDB')) {
    influxdb = new Influx(config('INFLUXDB') + config('NAME_VERSION'));
    setInterval(streamCountToInflux, 10000);
}

export default server;
