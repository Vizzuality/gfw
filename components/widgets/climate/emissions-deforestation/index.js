import { getEmissions, getEmissionsLossOTF } from 'services/analysis-cached';

import { shouldQueryPrecomputedTables } from 'components/widgets/utils/helpers';

import biomassLossIsos from 'data/biomass-isos.json';

import {
  POLITICAL_BOUNDARIES_DATASET,
  CARBON_EMISSIONS_DATASET,
} from 'data/datasets';

import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  CARBON_EMISSIONS,
} from 'data/layers';

import { getYearsRangeFromMinMax } from 'components/widgets/utils/data';

import treeLoss from 'components/widgets/forest-change/tree-loss';
import getWidgetProps from './selectors';

const MIN_YEAR = 2001;
const MAX_YEAR = 2020;

export default {
  ...treeLoss,
  widget: 'emissionsDeforestation',
  title: 'Forest-related greenhouse gas emissions in {location}',
  large: true,
  categories: ['climate'],
  types: ['geostore', 'country', 'aoi', 'use', 'wdpa'],
  admins: ['adm0', 'adm1', 'adm2'],
  chartType: 'composedChart',
  settingsConfig: [
    {
      key: 'gasesIncluded',
      label: 'Greenhouse gases included',
      type: 'select',
      border: true,
    },
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
      key: 'years',
      label: 'years',
      endKey: 'endYear',
      startKey: 'startYear',
      type: 'range-select',
      border: true,
    },
    {
      key: 'threshold',
      label: 'canopy density',
      type: 'mini-select',
      whitelist: [30, 50, 75],
      metaKey: 'widget_canopy_density',
    },
  ],
  datasets: [
    {
      dataset: POLITICAL_BOUNDARIES_DATASET,
      layers: [DISPUTED_POLITICAL_BOUNDARIES, POLITICAL_BOUNDARIES],
      boundary: true,
    },
    {
      dataset: CARBON_EMISSIONS_DATASET,
      layers: [CARBON_EMISSIONS],
    },
  ],
  pendingKeys: ['threshold'],
  refetchKeys: ['threshold', 'landCategory', 'forestType'],
  visible: ['dashboard', 'analysis', 'aoi'],
  metaKey: 'widget_gfw_forest_carbon_emissions',
  dataType: 'flux',
  colors: 'climate',
  sortOrder: {
    climate: 2,
  },
  sentences: {
    initial:
      'Between {startYear} and {endYear}, an average of {annualAvg} per year was released into the atmosphere as a result of tree cover loss in {location}. In total, {value} was emitted in this period',
    co2Only: ', considering emissions from CO\u2082 only.',
    nonCo2Only: ', considering emissions from non-CO\u2082 gases only.',
  },
  settings: {
    gasesIncluded: 'allGases',
    includesGainPixels: true,
    threshold: 30,
  },
  whitelists: {
    adm0: biomassLossIsos,
  },
  getData: (params) => {
    const { startYear, endYear, range } = getYearsRangeFromMinMax(
      MIN_YEAR,
      MAX_YEAR
    );
    if (shouldQueryPrecomputedTables(params)) {
      return getEmissions(params).then((response) => {
        const loss = response?.data?.data || [];

        return {
          loss,
          settings: {
            startYear,
            endYear,
            yearsRange: range,
          },
          options: {
            years: range,
          },
        };
      });
    }
    // Run OTF analysis
    const geostoreId = params?.geostore?.hash;
    return getEmissionsLossOTF({
      ...params,
      startYear,
      endYear,
      geostoreId,
      staticStatement: {
        // overrides tables and/or sql
        table: 'umd_tree_cover_loss',
      },
    }).then((response) => {
      const loss = response?.data?.data || [];

      return {
        loss,
        settings: {
          startYear,
          endYear,
          yearsRange: range,
        },
      };
    });
  },
  getDataURL: (params) => [getEmissions({ ...params, download: true })],
  getWidgetProps,
};
