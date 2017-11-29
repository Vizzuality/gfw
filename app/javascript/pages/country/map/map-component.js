import React, { PureComponent } from 'react';
import Proptypes from 'prop-types';

import Layers from 'map/layers';
import grayscale from 'map/maptypes/grayscale';

import Loader from 'components/loader/loader';

class Map extends PureComponent {
  componentDidMount() {
    const { setInitialData } = this.props;

    setInitialData(this.props);
  }

  componentWillUpdate(nextProps) {
    const { isLoading, checkLoadingStatus } = this.props;
    if (!nextProps.isLoading && isLoading) {
      this.buildMap(nextProps);
    } else {
      checkLoadingStatus(nextProps);
    }

    this.checkLayers(this.props, nextProps);
  }

  onMapInit() {
    const { layers } = this.props;
    this.setLayers(layers);
  }

  setListeners() {
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.onMapInit();
    });
  }

  setMaptypes() {
    this.map.mapTypes.set('grayscale', grayscale());
  }

  setMaptypeId(maptype) {
    this.map.setMapTypeId(maptype);
  }

  setLayers(layers) {
    const { layerSpec } = this.props;

    layers.forEach((slug, index) => {
      const layer = new Layers[slug](this.map, { layerSpec: layerSpec[slug] });
      layer.getLayer().then(res => {
        this.map.overlayMapTypes.setAt(index, res);
      });
    });
  }

  buildMap(nextProps) {
    const { zoom, maptype, bounds, maxZoom, minZoom, mapOptions } = nextProps;

    const boundsMap = new google.maps.LatLngBounds();
    bounds.forEach(item => {
      boundsMap.extend(new google.maps.LatLng(item[1], item[0]));
    });

    const options = {
      options: Object.assign({}, mapOptions, {
        zoom,
        center: {
          lat: boundsMap.getCenter().lat(),
          lng: boundsMap.getCenter().lng()
        },
        maxZoom,
        minZoom
      })
    };
    this.map = new google.maps.Map(document.getElementById('map'), options);
    this.map.fitBounds(boundsMap);
    this.setMaptypes();
    this.setMaptypeId(maptype);
    this.setListeners();
    this.checkLayers(this.props, nextProps);
  }

  checkLayers(props, nextProps) {
    const oldLayers = props.layers;
    const newLayers = nextProps.layers;
    const sameLayers =
      oldLayers.length === newLayers.length &&
      oldLayers.every((element, index) => element === newLayers[index]);

    if (!sameLayers) {
      this.updateLayers(newLayers);
    }
  }

  removeLayers() {
    const { layers } = this.props;

    layers.forEach((slug, index) => {
      this.map.overlayMapTypes.setAt(index, null);
    });
  }

  updateLayers(layers) {
    this.removeLayers();
    this.setLayers(layers);
  }

  render() {
    return (
      <div id="map" className="c-map">
        <Loader isAbsolute />
      </div>
    );
  }
}

Map.propTypes = {
  isLoading: Proptypes.bool.isRequired,
  layerSpec: Proptypes.object.isRequired,
  checkLoadingStatus: Proptypes.func.isRequired,
  setInitialData: Proptypes.func.isRequired
};

Map.defaultProps = {
  mapOptions: {}
};

export default Map;
