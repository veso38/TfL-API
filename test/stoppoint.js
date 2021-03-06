//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../dist/index').default;
chai.should();
let geojsonValidation = require('geojson-validation');

chai.use(chaiHttp);

describe('StopPoints', () => {
    describe('GET /Stoppoint', () => {
        it('should get all the stoppoints as geojson', (done) => {
            chai.request(server)
                .get('/StopPoint')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    geojsonValidation.isFeatureCollection(res.body).should.be.equal(true);
                    res.body.features.length.should.be.above(2500);
                    for(var i = 0; i < res.body.features.length; i++) {
                        var props = res.body.features[i].properties;
                        props.id.should.be.a('Number');
                        props.name.should.be.a('String');
                        props.should.not.have.property('distance');
                    }
                    done();
                });
        });
    });
    describe('GET /Stoppoint/200901011', () => {
        it('should get "Strassen, Schoenacht" Stoppoint as geojson', (done) => {
            chai.request(server)
                .get('/StopPoint/200901011')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    geojsonValidation.isFeature(res.body).should.be.equal(true);
                    res.body.properties.id.should.be.equal(200901011);
                    res.body.properties.name.should.be.equal('Strassen, Schoenacht');
                    res.body.properties.should.not.have.property('distance');
                    done();
                });
        });
    });
    describe('GET /StopPoint/around/6.133646/49.60067/100', () => {
        it('should get stoppoints around Luxembourg Central station (LON:6.133646 LAT:49.60067 MAX_DISTANCE:100m) as geojson', (done) => {
            chai.request(server)
                .get('/StopPoint/around/6.133646/49.60067/100')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    geojsonValidation.isFeatureCollection(res.body).should.be.equal(true);
                    res.body.features.length.should.be.within(2,10);
                    for(var i = 0; i < res.body.features.length; i++) {
                        var props = res.body.features[i].properties;
                        props.id.should.be.a('Number');
                        props.name.should.be.a('String');
                        props.distance.should.be.a('Number');
                    }
                    done();
                });
        });
    });
    describe('GET /StopPoint/box/6.133052/49.60067/6.133646/49.600814', () => {
        it('should get stoppoints in bounding box as geojson', (done) => {
            chai.request(server)
                .get('/StopPoint/box/6.133052/49.60067/6.133646/49.600814')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    geojsonValidation.isFeatureCollection(res.body).should.be.equal(true);
                    res.body.features.length.should.be.equal(2);
                    for(var i = 0; i < res.body.features.length; i++) {
                        var props = res.body.features[i].properties;
                        props.id.should.be.a('Number');
                        props.name.should.be.a('String');
                        props.should.not.have.property('distance');
                    }
                    done();
                });
        });
    });
    describe('GET /StopPoint/search/Schoenach', () => {
        it('should get stoppoints where name matches query as geojson', (done) => {
            chai.request(server)
                .get('/StopPoint/search/Schoenach')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    geojsonValidation.isFeatureCollection(res.body).should.be.equal(true);
                    res.body.features.length.should.be.equal(1,5);
                    for(var i = 0; i < res.body.features.length; i++) {
                        var props = res.body.features[i].properties;
                        props.id.should.be.a('Number');
                        props.name.should.be.a('String');
                        props.should.not.have.property('distance');
                    }
                    done();
                });
        });
    });
});
