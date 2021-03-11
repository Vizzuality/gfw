import { all, spread } from 'axios';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import tropicalIsos from 'data/tropical-isos.json';

import {
  POLITICAL_BOUNDARIES_DATASET,
  GLAD_DEFORESTATION_ALERTS_DATASET
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  GLAD_ALERTS
} from 'data/layers';

import { fetchGladAlerts, fetchGLADLatest } from 'services/analysis-cached';
import OTFAnalysis from 'services/otf-analysis';

import { shouldQueryPrecomputedTables } from 'components/widgets/utils/helpers';

import getWidgetProps from './selectors';

const getOTFAnalysis = async params => {
  const analysis = new OTFAnalysis(params.geostore.id);
  analysis.setData(['gladAlerts'], params);

  return analysis.getData().then(response => {
    const { gladAlerts } = response;
    const getLastAlert = gladAlerts?.data
      ? gladAlerts.data[gladAlerts.data.length - 1]
      : null;
    const latestDate = moment()
      .year(getLastAlert?.umd_glad_alerts__year)
      .week(getLastAlert?.umd_glad_alerts__isoweek)
      .format('YYYY-MM-DD');

    return {
      alerts:
        gladAlerts?.data &&
        sortBy(
          gladAlerts.data.map(d => ({
            week: d.umd_glad_alerts__isoweek,
            year: d.umd_glad_alerts__year,
            count: d.alert__count,
            alerts: d.alert__count
          })),
          'year'
        ),
      latest: latestDate,
      settings: { latestDate },
      downloadUrls: { csv: '', json: '' } // TODO: We need to get download URLS working here
    };
  });
};

export default {
  widget: 'gladAlerts',
  title: 'Deforestation alerts in {location}',
  sentence: {
    default:
      'There were {count} GLAD alerts reported in the week of the {date}. This was {status} compared to the same week in previous years.',
    withInd:
      'There were {count} GLAD alerts reported in {indicator} in the week of the {date}. This was {status} compared to the same week in previous years.'
  },
  metaKey: 'widget_deforestation_graph',
  large: true,
  visible: ['dashboard'],
  colors: 'loss',
  chartType: 'composedChart',
  source: 'gadm',
  dataType: 'glad',
  categories: ['summary', 'forest-change'],
  types: ['country', 'geostore', 'wdpa', 'aoi', 'use'],
  admins: ['adm0', 'adm1', 'adm2'],
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true
    },
    {
      dataset: GLAD_DEFORESTATION_ALERTS_DATASET,
      layers: [GLAD_ALERTS]
    }
  ],
  sortOrder: {
    summary: 6,
    forestChange: 9
  },
  pendingKeys: ['weeks'],
  refetchKeys: ['forestType', 'landCategory'],
  settingsConfig: [
    {
      key: 'forestType',
      label: 'Forest Type',
      type: 'select',
      placeholder: 'All tree cover',
      clearable: true
    },
    {
      key: 'landCategory',
      label: 'Land Category',
      type: 'select',
      placeholder: 'All categories',
      clearable: true,
      border: true
    },
    {
      key: 'weeks',
      label: 'show data for the last',
      type: 'select',
      whitelist: [13, 26, 52],
      noSort: true
    }
  ],
  whitelists: {
    adm0: tropicalIsos
  },
  settings: {
    period: 'week',
    weeks: 13,
    dataset: 'glad'
  },
  getData: params => {
    if (shouldQueryPrecomputedTables(params)) {
      return all([fetchGladAlerts(params), fetchGLADLatest(params)]).then(
        spread((alerts, latest) => {
          const gladsData = alerts && alerts.data.data;
          let data = {};
          if (gladsData && latest) {
            const latestDate =
              latest && latest.attributes && latest.attributes.updatedAt;

            data = {
              alerts: gladsData,
              latest: latestDate,
              settings: { latestDate }
            };
          }

          return data;
        })
      );
    }

    return getOTFAnalysis(params);
  },
  getDataURL: params => [fetchGladAlerts({ ...params, download: true })],
  getWidgetProps,
  parseInteraction: payload => {
    if (payload) {
      const startDate = moment().year(payload.year).week(payload.week);
      return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: startDate.add(7, 'days').format('YYYY-MM-DD'),
        updateLayer: true,
        ...payload
      };
    }
    return {};
  }
};
