import {
  fetchGLADLatest,
  fetchHistoricalGladAlerts,
} from 'services/analysis-cached';
import tropicalIsos from 'data/tropical-isos.json';

import {
  POLITICAL_BOUNDARIES_DATASET,
  GLAD_DEFORESTATION_ALERTS_DATASET,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  GLAD_ALERTS,
} from 'data/layers';

import getWidgetProps from './selectors';

export default {
  widget: 'gladAlertsDaily',
  title: 'Glad Alerts Count in {location}',
  large: true,
  refetchKeys: ['forestType', 'landCategory'],
  settingsConfig: [
    {
      key: 'forestType',
      label: 'Forest Type',
      type: 'select',
      placeholder: 'All tree cover',
      clearable: true,
    },
    {
      key: 'landCategory',
      label: 'Land Category',
      type: 'select',
      placeholder: 'All categories',
      clearable: true,
      border: true,
    },
  ],
  settings: {
    minDate: '2000-01-01',
  },
  visible: ['dashboard', 'analysis'],
  types: ['country', 'geostore', 'wdpa', 'aoi', 'use'],
  categories: ['summary', 'forest-change'],
  admins: ['adm0', 'adm1', 'adm2'],
  chartType: 'composedChart',
  source: 'gadm',
  dataType: 'glad',
  colors: 'loss',
  metaKey: 'widget_deforestation_graph',
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    {
      dataset: GLAD_DEFORESTATION_ALERTS_DATASET,
      layers: [GLAD_ALERTS],
    },
  ],
  sentences: {
    initial:
      'Between {start_date} and {end_date} {location} experienced a total of {total_alerts} glad alerts.',
    withInd:
      'Between {start_date} and {end_date} {location} experienced a total of {total_alerts} glad alerts within {indicator}.',
  },
  whitelists: {
    adm0: tropicalIsos,
  },
  getData: (params) =>
    fetchGLADLatest(params)
      .then((response) => response?.attributes?.updatedAt || null)
      .then((latest) =>
        fetchHistoricalGladAlerts({
          ...params,
          frequency: 'daily',
          startDate: params.minDate,
          endDate: latest,
        })
          .then((alerts) => {
            const { data } = alerts.data;
            return {
              settings: {
                startDate:
                  data && data.length > 0 && data[data.length - 1].alert__date,
                endDate: latest,
              },
              data,
            };
          })
          .catch(() => {
            return null;
          })
      ),
  getDataURL: (params) => [
    fetchHistoricalGladAlerts({
      ...params,
      frequency: 'daily',
      download: true,
    }),
  ],
  getWidgetProps,
};
