import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import WorldMap from 'components/world-map';
import NumberedList from 'components/widgets/components/widget-numbered-list';

import './styles';

class WidgetTraseCommodities extends PureComponent {
  render() {
    const { data, settings, embed, setWidgetSettings, widget } = this.props;
    const { rankedData } = data;

    return (
      <div className="c-widget-trase-commodities">
        {data && <WorldMap className="simple-map" {...data} />}
        {rankedData && (
          <NumberedList
            className="locations-list"
            data={rankedData}
            settings={settings}
            linkExt={embed}
            widget={widget}
            setWidgetSettings={setWidgetSettings}
          />
        )}
      </div>
    );
  }
}

WidgetTraseCommodities.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
  settings: PropTypes.object,
  embed: PropTypes.bool,
  widget: PropTypes.string,
  setWidgetSettings: PropTypes.func
};
export default WidgetTraseCommodities;
