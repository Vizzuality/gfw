import { createSelector } from 'reselect';
import sumBy from 'lodash/sumBy';
import isEmpty from 'lodash/isEmpty';
import { sortByKey } from 'utils/data';
import { format } from 'd3-format';

import globalLandCoverCategories from 'data/global-land-cover-categories.json';

// get list data
const getData = state => state.data;
const getSettings = state => state.settings;
const getCurrentLocation = state => state.currentLabel;
const getColors = state => state.colors;
const getSentences = state => state.config && state.config.sentences;

// get lists selected
export const parseData = createSelector(
  [getData, getColors],
  (data, colors) => {
    if (isEmpty(data)) return null;
    let keys = [];
    globalLandCoverCategories.forEach(c => {
      keys = keys.concat(c.classes);
    });
    const dataGrouped = [];
    keys.forEach((k, i) => {
      dataGrouped[i] = {
        key: k,
        value: sumBy(data, k)
      };
    });
    const total = sumBy(dataGrouped, 'value');
    const dataFiltered = dataGrouped.filter(d => d.value);
    const dataMerged = [];
    globalLandCoverCategories.forEach((d, i) => {
      dataMerged[i] = {
        ...d,
        value: sumBy(
          dataFiltered.filter(o => d.classes.indexOf(o.key) > -1),
          'value'
        )
      };
    });
    const dataParsed = dataMerged.filter(el => el.value !== 0).map(el => ({
      ...el,
      percentage: 100 * el.value / total,
      value: el.value * 300 * 300 / 1e4,
      color: colors.categories[el.label]
    }));
    return sortByKey(dataParsed.filter(d => d !== null), 'value', true);
  }
);

export const getSentence = createSelector(
  [parseData, getSettings, getCurrentLocation, getSentences],
  (data, settings, currentLabel, sentences) => {
    if (isEmpty(data) || !sentences) return null;
    const { initial } = sentences;
    const { year } = settings;
    const { label, value } = data[0];
    const params = {
      location: currentLabel,
      year,
      category: label,
      extent: `${format('.3s')(value)}ha`
    };
    return {
      sentence: initial,
      params
    };
  }
);
