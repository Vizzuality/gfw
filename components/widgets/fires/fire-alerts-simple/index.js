import tropicalIsos from 'data/tropical-isos.json';

import {
  POLITICAL_BOUNDARIES_DATASET,
  FIRES_VIIRS_DATASET,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  FIRES_ALERTS_VIIRS,
} from 'data/layers';

import { isMapPage } from 'utils/location';

// function for retreiving glad alerts from tables
import {
  fetchVIIRSAlertsSum,
  fetchVIIRSAlertsSumOTF,
} from 'services/analysis-cached';

import { shouldQueryPrecomputedTables } from 'components/widgets/utils/helpers';

import getWidgetProps from './selectors';

export default {
  widget: 'firesAlertsSimple',
  title: 'Fire alerts in {location}',
  sentence: {
    default:
      'There were {count} {dataset} fire alerts reported in {location} between {startDate} and {endDate}, of which {highConfidencePercentage} were {high confidence alerts}.',
    withInd:
      'There were {count} {dataset} fire alerts reported in {indicator} in {location} between {startDate} and {endDate}, of which {highConfidencePercentage} were {high confidence alerts}.',
  },
  metaKey: 'widget_fire_alert_location',
  large: false,
  visible: ['dashboard', 'analysis'],
  colors: 'fires',
  chartType: 'pieChart',
  dataType: 'fires',
  categories: ['summary', 'fires'],
  types: ['geostore', 'country', 'wdpa', 'aoi', 'use'],
  admins: ['adm0', 'adm1', 'adm2'],
  adm0: [
    'AFG',
    'AGO',
    'ALB',
    'AND',
    'ANT',
    'ARE',
    'ARG',
    'ARM',
    'AUS',
    'AUT',
    'AZE',
    'BDI',
    'BEL',
    'BEN',
    'BFA',
    'BGD',
    'BGR',
    'BHR',
    'BHS',
    'BIH',
    'BLM',
    'BLR',
    'BLZ',
    'BOL',
    'BRA',
    'BRB',
    'BRN',
    'BTN',
    'BWA',
    'CAF',
    'CAN',
    'CHE',
    'CHL',
    'CHN',
    'CIV',
    'CMR',
    'COD',
    'COG',
    'COL',
    'COM',
    'CPV',
    'CRI',
    'CUB',
    'CYP',
    'CZE',
    'DEU',
    'DJI',
    'DMA',
    'DNK',
    'DOM',
    'DZA',
    'ECU',
    'EGY',
    'ERI',
    'ESP',
    'EST',
    'ETH',
    'FIN',
    'FJI',
    'FLK',
    'FRA',
    'FSM',
    'GAB',
    'GBR',
    'GEO',
    'GHA',
    'GIB',
    'GIN',
    'GLP',
    'GMB',
    'GNB',
    'GNQ',
    'GRC',
    'GRL',
    'GTM',
    'GUF',
    'GUM',
    'GUY',
    'HND',
    'HRV',
    'HTI',
    'HUN',
    'IDN',
    'IND',
    'IRL',
    'IRN',
    'IRQ',
    'ISR',
    'ITA',
    'JAM',
    'JOR',
    'JPN',
    'KAZ',
    'KEN',
    'KGZ',
    'KHM',
    'KIR',
    'KNA',
    'KOR',
    'KWT',
    'LAO',
    'LBN',
    'LBR',
    'LBY',
    'LCA',
    'LIE',
    'LKA',
    'LSO',
    'LTU',
    'LUX',
    'LVA',
    'MAR',
    'MCO',
    'MDA',
    'MDG',
    'MDV',
    'MEX',
    'MHL',
    'MKD',
    'MLI',
    'MLT',
    'MMR',
    'MNE',
    'MNG',
    'MNP',
    'MOZ',
    'MRT',
    'MSR',
    'MTQ',
    'MUS',
    'MWI',
    'MYS',
    'NAM',
    'NCL',
    'NER',
    'NGA',
    'NIC',
    'NLD',
    'NOR',
    'NPL',
    'NZL',
    'OMN',
    'PAK',
    'PAN',
    'PCN',
    'PER',
    'PHL',
    'PNG',
    'POL',
    'PRI',
    'PRK',
    'PRT',
    'PRY',
    'PSE',
    'PYF',
    'QAT',
    'REU',
    'ROU',
    'RUS',
    'RWA',
    'SAU',
    'SDN',
    'SEN',
    'SGP',
    'SLB',
    'SLE',
    'SLV',
    'SOM',
    'SRB',
    'SSD',
    'STP',
    'SUR',
    'SVK',
    'SVN',
    'SWE',
    'SWZ',
    'SYR',
    'TCD',
    'TGO',
    'THA',
    'TJK',
    'TKL',
    'TKM',
    'TLS',
    'TON',
    'TTO',
    'TUN',
    'TUR',
    'TUV',
    'TZA',
    'UGA',
    'UKR',
    'URY',
    'USA',
    'UZB',
    'VAT',
    'VEN',
    'VIR',
    'VNM',
    'VUT',
    'WSM',
    'YEM',
    'ZAF',
    'ZMB',
    'ZWE',
  ],
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    {
      dataset: FIRES_VIIRS_DATASET,
      layers: [FIRES_ALERTS_VIIRS],
    },
  ],
  sortOrder: {
    summary: 9999,
    fires: 9999,
  },
  pendingKeys: [],
  refetchKeys: [
    'dataset',
    'forestType',
    'landCategory',
    'startDate',
    'endDate',
  ],
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
    {
      key: 'dataset',
      whitelist: ['viirs', 'modis'],
      label: 'fires dataset',
      type: 'select',
    },
    {
      key: 'dateRange',
      label: 'Range',
      endKey: 'endDate',
      startKey: 'startDate',
      type: 'datepicker',
    },
  ],
  settingsBtnConfig: {
    text: '+ Select an intersection',
    shouldShowButton: (props) =>
      !props.settings.forestType &&
      !props.settings.landCategory &&
      !isMapPage(props?.location),
  },
  // where should we see this widget
  whitelists: {
    adm0: tropicalIsos,
  },
  // initial settings
  settings: {
    dataset: 'viirs',
  },
  getData: (params) => {
    const { VIIRS } = params.GFW_META.datasets;
    const defaultStartDate = VIIRS?.defaultStartDate;
    const defaultEndDate = VIIRS?.defaultEndDate;
    const startDate = params?.startDate || defaultStartDate;
    const endDate = params?.endDate || defaultEndDate;
    if (shouldQueryPrecomputedTables(params)) {
      return fetchVIIRSAlertsSum({
        ...params,
        startDate,
        endDate,
      }).then((alerts) => {
        const firesData = alerts && alerts.data.data;
        let data = {};
        if (firesData && VIIRS) {
          data = {
            alerts: firesData,
            settings: {
              startDate,
              endDate,
            },
            options: {
              minDate: '2000-01-01',
              maxDate: defaultEndDate,
            },
          };
        }
        return data;
      });
    }
    const geostoreId = params?.geostore?.hash;
    return fetchVIIRSAlertsSumOTF({
      ...params,
      geostoreId,
      staticStatement: {
        // append: true, If active, we will utalise the old location select logic with our statement
        statement: 'alert__date',
        table: 'nasa_viirs_fire_alerts',
      },
    }).then((alertsResponse) => {
      const alerts = alertsResponse.data.data;
      return {
        alerts:
          alerts &&
          alerts.map((d) => ({
            ...d,
            alerts: d.count,
          })),
      };
    });
  },
  maxDownloadSize: {
    maxSize: 1e5,
    key: 'alerts',
    subKey: 'alert__count',
  },
  getDataURL: (params) => [
    fetchVIIRSAlertsSum({
      ...params,
      download: true,
      staticStatement: {
        // append: true, If active, we will utalise the old location select logic with our statement
        download: {
          // Only apply to "download" endpoint
          statement: 'latitude, longitude, alert__date',
          table: 'nasa_viirs_fire_alerts',
        },
      },
    }),
  ],
  getWidgetProps,
};
