import { getBiomassStockGrouped } from 'services/analysis-cached';

import {
  POLITICAL_BOUNDARIES_DATASET,
  TREE_BIOMASS_DENSITY_DATASET,
} from 'data/datasets';
import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  TREE_BIOMASS_DENSITY,
} from 'data/layers';

import getWidgetProps from './selectors';

export default {
  widget: 'whrc-biomass',
  title: {
    default: 'Aboveground live woody biomass in {location}',
    global: 'Global aboveground live woody biomass',
  },
  categories: ['climate'],
  types: ['global', 'country'],
  admins: ['global', 'adm0', 'adm1', 'adm2'],
  settingsConfig: [
    {
      key: 'unit',
      label: 'unit',
      type: 'switch',
      whitelist: ['totalBiomass', 'biomassDensity'],
      border: true,
    },
    {
      key: 'threshold',
      label: 'canopy density',
      type: 'mini-select',
      metaKey: 'widget_canopy_density',
    },
  ],
  refetchKeys: ['unit', 'threshold'],
  chartType: 'rankedList',
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    // above ground woody biomass
    {
      dataset: TREE_BIOMASS_DENSITY_DATASET,
      layers: [TREE_BIOMASS_DENSITY],
    },
  ],
  visible: ['dashboard', 'analysis', 'geostore'],
  colors: 'climate',
  metaKey: 'aboveground_biomass',
  sortOrder: {
    summary: 0,
    forestChange: 0,
  },
  sentences: {
    initial:
      'In 2000, {location} had an aboveground live woody biomass density of {biomassDensity}, and a total aboveground biomass of {totalBiomass}.',
    totalBiomass:
      'Around {value} of the world’s {label} is contained in the top 5 countries.',
    biomassDensity:
      'The average {label} of the world’s top 5 countries is {value}.',
  },
  settings: {
    threshold: 30,
    startYear: 2001,
    endYear: 2018,
    extentYear: 2000,
    layers: ['loss'],
    pageSize: 5,
    page: 0,
    unit: 'totalBiomass',
  },
  whitelists: {
    checkStatus: true,
  },
  getData: ({ type, adm0, adm1, adm2, ...rest } = {}) => {
    const location =
      type === 'country'
        ? {
            type,
            adm0: adm0 && !adm1 ? null : adm0,
            adm1: adm1 && !adm2 ? null : adm1,
            adm2: null,
          }
        : {
            type,
            adm0,
            adm1,
            adm2,
          };

    return getBiomassStockGrouped({ ...rest, ...location }).then(
      (biomassResponse) => {
        const { data } = biomassResponse.data;
        let mappedData = [];
        if (data && data.length) {
          mappedData = data.map((item) => {
            const { extent, biomass, carbon } = item;
            const biomassDensity =
              biomass > 0 && extent > 0 ? biomass / extent : 0;
            return {
              ...item,
              biomassDensity,
              extent: extent || 0,
              biomass: biomass || 0,
              carbon: carbon || 0,
            };
          });
        }
        return mappedData;
      }
    );
  },
  getDataURL: ({ type, adm0, adm1, adm2, ...rest } = {}) => {
    const location =
      type === 'country'
        ? {
            type,
            adm0: adm0 && !adm1 ? null : adm0,
            adm1: adm1 && !adm2 ? null : adm1,
            adm2: null,
          }
        : {
            type,
            adm0,
            adm1,
            adm2,
          };

    return [getBiomassStockGrouped({ ...rest, ...location, download: true })];
  },
  getWidgetProps,
};
