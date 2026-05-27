import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: [49.29494887590408, 53.59224334359169],
        zoom: 18,
        projection: 'EPSG:4326'
    })
});

const wmsLayer = new ImageLayer({
    source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/gis/wms',
        params: {
            LAYERS: 'gis:buildings',
            TILED: true
        },
        ratio: 1,
        serverType: 'geoserver'
    })
});

map.addLayer(wmsLayer);