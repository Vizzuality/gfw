import { fetchFireAlertsByGeostore } from 'services/analysis';

import {
  POLITICAL_BOUNDARIES_DATASET,
  FIRES_VIIRS_DATASET,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  FIRES_ALERTS_VIIRS,
} from 'data/layers';

import getWidgetProps from './selectors';

export default {
  widget: 'fires',
  title: 'Fires in {location}',
  categories: ['forest-change', 'summary'],
  admins: ['adm0', 'adm1', 'adm2'],
  types: [],
  metaKey: 'widget_fire_alert_location',
  type: 'fires',
  colors: 'fires',
  sortOrder: {
    summary: 7,
    forestChange: 11,
  },
  visible: ['analysis'],
  chartType: 'listLegend',
  sentences: {
    initial: '{count} active fires detected in {location} in the last 7 days.',
  },
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    // fires
    {
      dataset: FIRES_VIIRS_DATASET,
      layers: [FIRES_ALERTS_VIIRS],
    },
  ],
  getData: (params) =>
    fetchFireAlertsByGeostore(params).then((response) => ({
      fires: response.data.data.attributes.value,
    })),
  getWidgetProps,
};
