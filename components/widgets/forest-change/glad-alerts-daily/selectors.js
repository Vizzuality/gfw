import { createSelector, createStructuredSelector } from 'reselect';
import moment from 'moment';
import { format } from 'd3-format';
import isEmpty from 'lodash/isEmpty';
import sumBy from 'lodash/sumBy';
import sortBy from 'lodash/sortBy';

import { getChartConfig } from 'components/widgets/utils/data';

const getAlerts = (state) => state.data?.data || null;
const getColors = (state) => state.colors || null;
const getStartDate = (state) => state.settings.startDate;
const getEndDate = (state) => state.settings.endDate;
const getSentences = (state) => state.sentences || null;
const getLocationObject = (state) => state.location;
const getOptionsSelected = (state) => state.optionsSelected;
const getIndicator = (state) => state.indicator;
const getStartIndex = (state) => state.settings.startIndex;
const getEndIndex = (state) => state.settings.endIndex || null;

const zeroFillDays = (startDate, endDate) => {
  const start = moment(startDate);
  const diffInDays = moment(endDate).diff(moment(startDate), 'days');
  const dates = Array.from(Array(diffInDays).keys());

  return [
    startDate,
    ...dates.map(() => start.add(1, 'days').format('YYYY-MM-DD')),
  ];
};

export const getData = createSelector(
  [getAlerts, getStartDate, getEndDate],
  (data, startDate, endDate) => {
    if (!data || isEmpty(data)) return null;

    const zeroFilledData = zeroFillDays(startDate, endDate).map((date) => ({
      date,
      alert__count: 0,
      count: 0,
      ...data.find((d) => d.alert__date === date),
    }));
    return sortBy(zeroFilledData, 'date');
  }
);

export const getStartEndIndexes = createSelector(
  [getStartIndex, getEndIndex, getData],
  (startIndex, endIndex, currentData) => {
    if (!currentData) {
      return {
        startIndex,
        endIndex,
      };
    }

    const start =
      startIndex || startIndex === 0 ? startIndex : currentData.length - 365;

    const end =
      endIndex && currentData.length - 1 >= endIndex
        ? endIndex
        : currentData.length - 1;

    return {
      startIndex: start,
      endIndex: end,
    };
  }
);

export const parseBrushedData = createSelector(
  [getData, getStartEndIndexes],
  (data, indexes) => {
    if (!data) return null;
    const { startIndex, endIndex } = indexes;

    const start = startIndex || 0;
    const end = endIndex || data.length - 1;
    return data.slice(start, end + 1);
  }
);

export const parseConfig = createSelector(
  [getColors, getStartEndIndexes],
  (colors, indexes) => {
    const { startIndex, endIndex } = indexes;

    const tooltip = [
      {
        label: 'GLAD alerts',
      },
      {
        key: 'count',
        labelKey: 'date',
        labelFormat: (value) => moment(value).format('MMM DD YYYY'),
        unit: ' GLAD alerts',
        color: colors.main,
        unitFormat: (value) =>
          Number.isInteger(value) ? format(',')(value) : value,
      },
    ];

    return {
      ...getChartConfig(colors),
      tooltip,
      xAxis: {
        tickFormatter: (t) => moment(t).format('MMM DD, YY'),
      },
      brush: {
        width: '100%',
        height: 60,
        margin: {
          top: 0,
          right: 10,
          left: 48,
          bottom: 12,
        },
        minimumGap: 30,
        maximumGap: 0,
        dataKey: 'date',
        startIndex: startIndex || 0,
        endIndex,
        config: {
          margin: {
            top: 5,
            right: 0,
            left: 42,
            bottom: 20,
          },
          yKeys: {
            lines: {
              count: {
                stroke: colors.main,
                isAnimationActive: false,
              },
              compareCount: {
                stroke: '#49b5e3',
                isAnimationActive: false,
              },
            },
          },
          xAxis: {
            hide: true,
            scale: 'point',
          },
          yAxis: {
            hide: true,
          },
          cartesianGrid: {
            horizontal: false,
            vertical: false,
          },
          height: 60,
        },
      },
    };
  }
);

export const parseSentence = createSelector(
  [
    parseBrushedData,
    getColors,
    getSentences,
    getLocationObject,
    getOptionsSelected,
    getIndicator,
  ],
  (data, colors, sentences, location, options, indicator) => {
    if (!data || !data.length) return null;
    const { initial, withInd } = sentences;
    const { dataset } = options;
    const indicatorLabel =
      indicator && indicator.label ? indicator.label : null;

    const startDate = data[0].date;
    const endDate = data[data.length - 1].date;
    const total = sumBy(data, 'alert__count');

    const sentence = indicator ? withInd : initial;

    const params = {
      location: location.label || '',
      indicator: indicatorLabel,
      start_date: moment(startDate).format('Do of MMMM YYYY'),
      end_date: moment(endDate).format('Do of MMMM YYYY'),
      dataset: dataset && dataset.label,
      total_alerts: {
        value: total ? format(',')(total) : 0,
        color: colors.main,
      },
    };
    return { sentence, params };
  }
);

export default createStructuredSelector({
  originalData: getData,
  data: parseBrushedData,
  config: parseConfig,
  sentence: parseSentence,
});
