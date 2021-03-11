import { all, spread } from 'axios';
import { getCumulative } from 'services/climate';
import moment from 'moment';

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
  widget: 'cumulativeGlad',
  title: 'New York Declaration Forest disturbance tracker',
  large: true,
  categories: ['climate'],
  chartType: 'composedChart',
  settingsConfig: [
    {
      key: 'variable',
      label: 'Variable',
      type: 'switch',
      whitelist: ['cumulative_emissions', 'cumulative_deforestation'],
    },
    {
      key: 'year',
      label: 'years',
      type: 'select',
    },
  ],
  refetchKeys: ['variable'],
  visible: ['dashboard'],
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    // GLAD
    {
      dataset: GLAD_DEFORESTATION_ALERTS_DATASET,
      layers: [GLAD_ALERTS],
    },
  ],
  types: ['country'],
  admins: ['adm0'],
  colors: 'fires',
  metaKey: 'widget_nydf_emissions_tracker',
  sortOrder: {
    summary: 100,
    forestChange: 100,
  },
  sentences: {
    cumulative_deforestation: `By week {weeknum} of {year}, there were {alerts}
confirmed alerts and {deforestation} of tree cover loss, comprising {budget} of
the annual budget. The values are shown in relation to deforestation
across previous years, indicated by the grey shading.`,
    cumulative_emissions: `By week {weeknum} of {year}, there were {alerts}
confirmed alerts and {emissions} emissions, comprising {budget} of
the annual budget. The values are shown in relation to emissions
across previous years, indicated by the grey shading.`,
  },
  whitelists: {
    adm0: [
      'BRA',
      'BRN',
      'BDI',
      'CMR',
      'CAF',
      'COD',
      'GNQ',
      'GAB',
      'IDN',
      'MYS',
      'PNG',
      'PER',
      'COG',
      'RWA',
      'SGP',
      'TLS',
    ],
  },
  settings: {
    year: 2018,
    variable: 'cumulative_deforestation',
  },
  getData: (params) =>
    all([...getCumulative(params)]).then(
      spread((y2015, y2016, y2017, y2018) => {
        const years = [2015, 2016, 2017, 2018].map((year) => ({
          label: year,
          value: year,
        }));
        const data = {
          2015: y2015.data && y2015.data.data,
          2016: y2016.data && y2016.data.data,
          2017: y2017.data && y2017.data.data,
          2018: y2018.data && y2018.data.data,
        };

        return {
          data,
          options: { year: years },
        };
      })
    ),
  getDataURL: (params) => getCumulative({ ...params, download: true }),
  getWidgetProps,
  parseInteraction: (payload) => {
    if (payload) {
      const startDate = moment().year(payload.year).week(payload.week);

      return {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: startDate.add(7, 'days'),
        ...payload,
      };
    }
    return {};
  },
};
