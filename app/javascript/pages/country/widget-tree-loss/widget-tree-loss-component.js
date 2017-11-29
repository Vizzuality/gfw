import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import numeral from 'numeral';

import Loader from 'components/loader/loader';
import TooltipChart from 'pages/country/tooltip-chart';
import WidgetHeader from 'pages/country/widget-header';
import WidgetTreeLossSettings from './widget-tree-loss-settings-component';

class WidgetTreeLoss extends PureComponent {
  componentDidMount() {
    const { setInitialData } = this.props;
    setInitialData(this.props);
  }

  componentWillUpdate(nextProps) {
    const { updateData, settings } = this.props;

    if (JSON.stringify(settings) !== JSON.stringify(nextProps.settings)) {
      updateData(nextProps);
    }
  }

  render() {
    const {
      location,
      isLoading,
      viewOnMap,
      total,
      yearsLoss,
      years,
      units,
      settings,
      canopies,
      locations,
      setTreeLossSettingsLocation,
      setTreeLossSettingsUnit,
      setTreeLossSettingsCanopy,
      setTreeLossSettingsStartYear,
      setTreeLossSettingsEndYear
    } = this.props;

    const unitMeasure = settings.unit === 'ha' ? 'ha' : '%';
    return (
      <div className="c-widget c-widget-tree-loss">
        <WidgetHeader
          title={'Tree cover loss'}
          viewOnMapCallback={viewOnMap}
          shareAnchor={'tree-loss'}
        >
          <WidgetTreeLossSettings
            type="settings"
            locations={locations}
            units={units}
            canopies={canopies}
            settings={settings}
            yearsLoss={yearsLoss}
            onLocationChange={setTreeLossSettingsLocation}
            onUnitChange={setTreeLossSettingsUnit}
            onCanopyChange={setTreeLossSettingsCanopy}
            onStartYearChange={setTreeLossSettingsStartYear}
            onEndYearChange={setTreeLossSettingsEndYear}
          />
        </WidgetHeader>
        {isLoading ? (
          <Loader isAbsolute />
        ) : (
          <div>
            <div className="c-widget-tree-loss__legend">
              <div className="contain-info-legend">
                <div className="c-widget-tree-loss__legend-title">
                  Total Tree Cover Loss
                </div>
                <div className="c-widget-tree-loss__legend-years">
                  ({`${settings.startYear} - ${settings.endYear}`})
                </div>
              </div>
              <div className="">
                <div className="c-widget-tree-loss__legend-title">
                  <span style={{ backgroundColor: '#f26798' }}>{}</span>
                  {location.admin1 ? 'Jurisdiction-wide' : 'Country-wide'}
                </div>
                <div
                  className="c-widget-tree-loss__legend-value"
                  style={{ color: '#f26798' }}
                >
                  {settings.unit === 'ha'
                    ? numeral(Math.round(total / 1000)).format('0,0')
                    : Math.round(total)}
                  {unitMeasure}
                </div>
              </div>
            </div>
            <div className="c-widget-tree-loss__chart">
              <ResponsiveContainer height={247} width={'100%'}>
                <BarChart
                  width={627}
                  height={247}
                  data={years}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="date"
                    padding={{ top: 135 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickCount={7}
                    tickFormatter={d =>
                      numeral(Math.round(d / 1000)).format('0,0')
                    }
                  />
                  <CartesianGrid vertical={false} strokeDasharray="3 4" />
                  <Tooltip content={<TooltipChart />} />
                  <Bar dataKey="value" barSize={22} fill="#fe6598" />
                  <Tooltip
                    percentage={settings.unit !== 'ha'}
                    content={<TooltipChart />}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }
}

WidgetTreeLoss.propTypes = {
  location: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  setInitialData: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  yearsLoss: PropTypes.array.isRequired,
  years: PropTypes.array.isRequired,
  units: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  canopies: PropTypes.array.isRequired,
  locations: PropTypes.array.isRequired,
  viewOnMap: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  setTreeLossSettingsLocation: PropTypes.func.isRequired,
  setTreeLossSettingsUnit: PropTypes.func.isRequired,
  setTreeLossSettingsCanopy: PropTypes.func.isRequired,
  setTreeLossSettingsStartYear: PropTypes.func.isRequired,
  setTreeLossSettingsEndYear: PropTypes.func.isRequired
};

export default WidgetTreeLoss;
