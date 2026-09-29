import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { applyStyle } from 'ol-mapbox-style';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({ source: new OSM() })
  ],
  view: new View({
    center: [49.2949, 53.5922],
    zoom: 18,
    projection: 'EPSG:4326'
  })
});

function addWmsLayer(layerName) {
  return new ImageLayer({
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/gis/wms',
      params: { LAYERS: layerName },
      ratio: 1,
      serverType: 'geoserver'
    })
  });
}
map.addLayer(addWmsLayer('gis:buildings'));
map.addLayer(addWmsLayer('gis:roads'));
map.addLayer(addWmsLayer('gis:poi'));

fetch('/overture.geojson')
  .then(response => response.json())
  .then(data => {
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })
      })
    });

    const mapboxStyle = {
      version: 8,
      sources: {
        overture: { type: 'geojson', data: data }
      },
      layers: [
        {
          id: 'overture-fill',
          type: 'fill',
          source: 'overture',
          paint: {
            'fill-color': [
              'match',
              ['get', 'source_type'],
              'my', '#00cc00',
              'osm', '#3388ff',
              'ml', '#ff8800',
              '#cccccc'
            ],
            'fill-opacity': 0.6
          }
        },
        {
          id: 'overture-outline',
          type: 'line',
          source: 'overture',
          paint: { 'line-color': '#ffffff', 'line-width': 1 }
        }
      ]
    };

    applyStyle(vectorLayer, mapboxStyle, 'overture').then(() => {
      map.addLayer(vectorLayer);
    });
  });