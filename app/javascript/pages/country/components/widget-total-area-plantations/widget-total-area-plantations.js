import { createElement } from 'react';
import { connect } from 'react-redux';

import WidgetTotalAreaPlantationsComponent from './widget-total-area-plantations-component';
import actions from './widget-total-area-plantations-actions';

export { initialState } from './widget-total-area-plantations-reducers';
export { default as reducers } from './widget-total-area-plantations-reducers';
export { default as actions } from './widget-total-area-plantations-actions';

const mapStateToProps = state => ({
  isLoading: state.widgetTotalAreaPlantations.isLoading,
  iso: state.root.iso,
  countryRegion: state.root.countryRegion,
  countryData: state.root.countryData,
  plantationData: state.widgetTotalAreaPlantations.plantationData,
  startYear: 2011,
  endYear: 2015,
  units: state.widgetTotalAreaPlantations.units,
  settings: state.widgetTotalAreaPlantations.settings,
});

const WidgetTotalAreaPlantationsContainer = (props) => {
  const setInitialData = (props) => {
    props.setPieCharDataPlantations([
      { name: 'Outside Plantations', value: 1200, color: '#e9e9ea' },
      { name: 'Large industrial plantation', value: 1100, color: '#fba79f' },
      { name: 'Mosaic of medium-sized plantations', value: 900, color: '#d29eea' },
      { name: 'Mosaic of small-sized plantations', value: 550, color: '#99cf95' },
      { name: 'Clearing/ very young plantation', value: 464, color: '#d3b294' },
    ]);
  };
  return createElement(WidgetTotalAreaPlantationsComponent, {
    ...props,
    setInitialData
  });
};

export default connect(mapStateToProps, actions)(WidgetTotalAreaPlantationsContainer);
