import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import HorizontalBarChart from 'components/charts/horizontal-bar-chart';

class WidgetHorizontalBarChart extends PureComponent {
  render() {
    const {
      parsedData,
      settings,
      config,
      setWidgetSettings,
      widget
    } = this.props;

    return (
      <HorizontalBarChart
        className="ranked-plantations-chart"
        data={parsedData}
        config={config}
        settings={settings}
        handlePageChange={change =>
          setWidgetSettings({
            value: { page: settings.page + change },
            widget
          })
        }
      />
    );
  }
}

WidgetHorizontalBarChart.propTypes = {
  parsedData: PropTypes.array,
  settings: PropTypes.object.isRequired,
  setWidgetSettings: PropTypes.func.isRequired,
  config: PropTypes.object,
  widget: PropTypes.string
};

export default WidgetHorizontalBarChart;