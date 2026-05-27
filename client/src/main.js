import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: [49.2949, 53.5922],
        zoom: 18,
        projection: 'EPSG:4326'
    })
});

fetch('/overture.geojson')
    .then(response => response.json())
    .then(data => {
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(data)
            }),
            style: function (feature) {
                const type = feature.get('source_type');
                let color = '#cccccc';
                if (type === 'my') color = '#00cc00';
                else if (type === 'osm') color = '#3388ff';
                else if (type === 'ml') color = '#ff8800';
                return new Style({
                    fill: new Fill({ color: color + '80' }),
                    stroke: new Stroke({ color: '#ffffff', width: 1 })
                });
            }
        });
        map.addLayer(vectorLayer);
    });