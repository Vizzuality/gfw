import { createSelector, createStructuredSelector } from 'reselect';
import moment from 'moment';
import { format } from 'd3-format';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import sumBy from 'lodash/sumBy';
import groupBy from 'lodash/groupBy';
import max from 'lodash/max';

import { getColorPalette } from 'utils/data';

import {
  getMeansData,
  getStdDevData,
  getDatesData,
  getChartConfig
} from 'components/widgets/utils/data';

const getAlerts = state => state.data && state.data.alerts;
const getLatest = state => state.data && state.data.latest;
const getColors = state => state.colors || null;
const getInteraction = state => state.settings.interaction || null;
const getWeeks = state => state.settings.weeks || null;
const getCompareYear = state => state.settings.compareYear || null;
const getDataset = state => state.settings.dataset || null;
const getSentences = state => state.sentence || null;
const getLocationObject = state => state.location;

export const getData = createSelector(
  [getAlerts, getLatest],
  (data, latest) => {
    if (!data || isEmpty(data)) return null;
    const groupedByYear = groupBy(sortBy(data, ['year', 'week']), 'year');
    const hasAlertsByYears = Object.values(groupedByYear).reduce(
      (acc, next) => {
        const { year } = next[0];
        return {
          ...acc,
          [year]: next.some(item => item.alerts > 0)
        };
      },
      {}
    );

    const dataYears = Object.keys(hasAlertsByYears).filter(
      key => hasAlertsByYears[key] === true
    );
    const minYear = Math.min(...dataYears.map(el => parseInt(el, 10)));
    const startYear =
      minYear === moment().year() ? moment().year() - 1 : minYear;

    const years = [];
    const latestWeek = moment(latest);
    const lastWeek = {
      isoWeek: latestWeek.isoWeek(),
      year: latestWeek.year()
    };

    for (let i = startYear; i <= lastWeek.year; i += 1) {
      years.push(i);
    }

    const yearLengths = {};
    years.forEach(y => {
      if (lastWeek.year === y) {
        yearLengths[y] = lastWeek.isoWeek;
      } else if (moment(`${y}-12-31`).isoWeek() === 1) {
        yearLengths[y] = moment(`${y}-12-31`)
          .subtract('week', 1)
          .isoWeek();
      } else {
        yearLengths[y] = moment(`${y}-12-31`).isoWeek();
      }
    });

    const zeroFilledData = [];

    years.forEach(d => {
      const yearDataByWeek = groupBy(groupedByYear[d], 'week');
      for (let i = 1; i <= yearLengths[d]; i += 1) {
        zeroFilledData.push(
          yearDataByWeek[i]
            ? yearDataByWeek[i][0]
            : { alerts: 0, count: 0, week: i, year: parseInt(d, 10) }
        );
      }
    });

    return zeroFilledData;
  }
);

export const getMeans = createSelector([getData], data => {
  if (!data) return null;
  return getMeansData(
    data,
    moment()
      .subtract(2, 'w')
      .format('YYYY-MM-DD')
  );
});

export const getStdDev = createSelector(
  [getMeans, getData],
  (data, rawData) => {
    if (!data) return null;
    return getStdDevData(data, rawData);
  }
);

export const getDates = createSelector([getStdDev], data => {
  if (!data) return null;
  return getDatesData(data);
});

export const parseData = createSelector(
  [getData, getDates, getWeeks, getCompareYear],
  (data, currentData, weeks, compareYear) => {
    if (!data || !currentData) return null;

    const maxYear = max(currentData.map(d => d.year));

    return currentData
      .map(d => {
        const yearDifference = maxYear - d.year;
        const week = d.week;

        if (compareYear) {
          const compareWeek = data.find(
            dt => dt.year === compareYear - yearDifference && dt.week === week
          );

          return {
            ...d,
            compareCount: compareWeek ? compareWeek.count : null
          };
        }

        return d;
      })
      .slice(-weeks);
  }
);

export const parseConfig = createSelector(
  [getColors, getLatest],
  (colors, latest) => ({
    ...getChartConfig(colors, moment(latest)),
    brush: {
      dataKey: 'date'
    }
  })
);

export const parseSentence = createSelector(
  [
    parseData,
    getColors,
    getInteraction,
    getSentences,
    getDataset,
    getLocationObject
  ],
  (data, colors, interaction, sentence, dataset, location) => {
    if (!data) return null;
    let lastDate = data[data.length - 1] || {};
    const firstDate = data[0] || {};
    if (!isEmpty(interaction)) {
      lastDate = interaction;
    }
    // NOTE: the first/last date should reflect the brush start/end
    const total = sumBy(
      data.filter(el => el.date >= firstDate.date && el.date <= lastDate.date),
      'count'
    );
    const colorRange = getColorPalette(colors.ramp, 5);
    let statusColor = colorRange[4];
    const {
      count,
      twoPlusStdDev,
      plusStdDev,
      minusStdDev,
      twoMinusStdDev,
      date
    } =
      lastDate || {};

    let status = 'unusually low';
    if (twoPlusStdDev && count > twoPlusStdDev[1]) {
      status = 'unusually high';
      statusColor = colorRange[0];
    } else if (
      twoPlusStdDev &&
      count <= twoPlusStdDev[1] &&
      count > twoPlusStdDev[0]
    ) {
      status = 'high';
      statusColor = colorRange[1];
    } else if (
      plusStdDev &&
      minusStdDev &&
      count <= plusStdDev[1] &&
      count > minusStdDev[0]
    ) {
      status = 'average';
      statusColor = colorRange[2];
    } else if (
      twoMinusStdDev &&
      count >= twoMinusStdDev[0] &&
      count < twoMinusStdDev[1]
    ) {
      status = 'low';
      statusColor = colorRange[3];
    }

    const formattedData = moment(date).format('Do of MMMM YYYY');
    const params = {
      date: formattedData,
      location: location.label || '',
      fire_season_month: null, // helper neededd
      fire_season_length: 5,
      start_date: null, // brush start date
      end_date: null, // brush end date
      dataset_start_year: dataset === 'VIIRS' ? 2012 : 2001,
      dataset,
      count: {
        value: total ? format(',')(total) : 0,
        color: colors.main
      },
      status: {
        value: status,
        color: statusColor
      }
    };
    return { sentence, params };
  }
);

export default createStructuredSelector({
  data: parseData,
  config: parseConfig,
  sentence: parseSentence
});