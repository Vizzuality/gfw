import { createSelector } from 'reselect';
import uniqBy from 'lodash/uniqBy';
import findIndex from 'lodash/findIndex';
import { sortByKey, getColorPalette } from 'utils/data';
import { format } from 'd3-format';
import { getActiveFilter } from 'pages/country/widget/widget-selectors';

const getData = state => state.data || null;
const getLocation = state => state.location || null;
const getColors = state => state.colors || null;
const getSettings = state => state.settings || null;
const getOptions = state => state.options || null;

export const getSortedData = createSelector([getData], data => {
  if (!data || !data.length) return null;
  return sortByKey(uniqBy(data, 'iso'), 'rate', true).map((d, i) => ({
    ...d,
    rank: i + 1
  }));
});

export const getFilteredData = createSelector(
  [getSortedData, getLocation, getColors],
  (data, location, colors) => {
    if (!data || !data.length) return null;
    const locationIndex = findIndex(data, d => d.iso === location.country);
    const dataTrimmed = data.slice(locationIndex - 2, locationIndex + 3);
    const colorRange = getColorPalette(
      [colors.darkGreen, colors.lightGreen],
      dataTrimmed.length
    );
    return dataTrimmed.map((d, index) => ({
      ...d,
      label: d.name,
      color: colorRange[index],
      path: `/country/${d.iso}`,
      value: d.rate * 1000
    }));
  }
);

export const getSentence = createSelector(
  [getFilteredData, getLocation, getSettings, getOptions],
  (data, location, settings, options) => {
    if (!data || !data.length) return null;
    const countryData = data.find(d => location.country === d.iso) || null;
    const periods = options && options.periods;
    const period = getActiveFilter(settings, periods, 'period');

    return countryData
      ? `From <b>${period &&
          period.label}</b>, the rate of reforestation in <b>${
        countryData.label
      }</b> was <strong>${format('.3s')(
        countryData.value * 1000
      )}ha/year</strong>.`
      : '';
  }
);
