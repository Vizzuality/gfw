import { createElement } from 'react';
import { connect } from 'react-redux';

import { getTotalCover, getTotalIntactForest } from 'services/tree-cover';

import WidgetTreeCoverComponent from './widget-tree-cover-component';
import actions from './widget-tree-cover-actions';

export { initialState } from './widget-tree-cover-reducers';
export { default as reducers } from './widget-tree-cover-reducers';
export { default as actions } from './widget-tree-cover-actions';

const mapStateToProps = state => ({
  location: state.location.payload,
  locationNames: state.root.locationNames,
  areaHa: state.root.geostore.areaHa,
  isLoading: state.widgetTreeCover.isLoading,
  admin1List: state.root.admin1List,
  totalCover: state.widgetTreeCover.totalCover,
  totalIntactForest: state.widgetTreeCover.totalIntactForest,
  totalNonForest: state.widgetTreeCover.totalNonForest,
  title: state.widgetTreeCover.title,
  locations: state.widgetTreeCover.locations,
  units: state.widgetTreeCover.units,
  canopies: state.widgetTreeCover.canopies,
  settings: state.widgetTreeCover.settings
});

const WidgetTreeCoverContainer = props => {
  const setInitialData = () => {
    setWidgetData(props);
  };

  const updateData = newProps => {
    newProps.setTreeCoverIsLoading(true);
    setWidgetData(newProps);
  };

  const setWidgetData = newProps => {
    const { location, areaHa, settings, setTreeCoverValues } = newProps;
    getTotalCover(location.admin0, location.admin1, settings.canopy).then(
      totalCoverResponse => {
        getTotalIntactForest(location.admin0, location.admin1).then(
          totalIntactForestResponse => {
            if (totalIntactForestResponse.data.data.length > 0) {
              const totalCover = Math.round(
                totalCoverResponse.data.data[0].value
              );
              const totalIntactForest = Math.round(
                totalIntactForestResponse.data.data[0].value
              );
              const totalNonForest =
                Math.round(areaHa) - (totalCover + totalIntactForest);
              const values = {
                totalCover,
                totalIntactForest,
                totalNonForest,
                title: getTitle(newProps),
                locations: [
                  {
                    value: 'all',
                    label: 'All Region'
                  },
                  {
                    value: 'managed',
                    label: 'Managed'
                  },
                  {
                    value: 'protected_areas',
                    label: 'Protected Areas'
                  },
                  {
                    value: 'ifls',
                    label: 'IFLs'
                  }
                ]
              };

              setTreeCoverValues(values);
            }
          }
        );
      }
    );
  };

  const getTitle = newProps => {
    const { locationNames, settings } = newProps;

    const region =
      settings.location !== 'all' ? ` and ${settings.locationLabel}` : '';

    return `Forest cover ${region} in ${locationNames.current}`;
  };

  const viewOnMap = () => {
    props.setLayers(['forest2000', 'ifl_2013_deg']);
  };

  return createElement(WidgetTreeCoverComponent, {
    ...props,
    setInitialData,
    updateData,
    viewOnMap
  });
};

export default connect(mapStateToProps, actions)(WidgetTreeCoverContainer);
