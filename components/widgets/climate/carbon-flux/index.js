import { getCarbonFlux, getCarbonFluxOTF } from 'services/analysis-cached';

// import OTFAnalysis from 'services/otf-analysis';

// TODO: carbon flux layer&dataset
import {
  POLITICAL_BOUNDARIES_DATASET,
  CARBON_FLUX_DATASET,
} from 'data/datasets';

import {
  DISPUTED_POLITICAL_BOUNDARIES,
  POLITICAL_BOUNDARIES,
  CARBON_FLUX,
} from 'data/layers';

import { shouldQueryPrecomputedTables } from 'components/widgets/utils/helpers';

import getWidgetProps from './selectors';

export default {
  widget: 'carbonFlux',
  title: {
    default: 'Forest-related greenhouse gas fluxes in {location}',
    global: 'Global Forest-related greenhouse gas fluxes',
  },
  large: true,
  categories: ['climate'],
  types: ['geostore', 'global', 'country', 'aoi', 'use', 'wdpa'],
  admins: ['global', 'adm0', 'adm1', 'adm2'],
  chartType: 'composedChart',
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
      dataset: CARBON_FLUX_DATASET,
      layers: [CARBON_FLUX],
    },
  ],
  pendingKeys: ['threshold'],
  refetchKeys: ['threshold', 'landCategory', 'forestType'],
  visible: ['dashboard', 'analysis', 'aoi'],
  metaKey: 'gfw_widget_forest_carbon_net_flux',
  dataType: 'flux',
  colors: 'climate',
  sortOrder: {
    climate: 2,
  },
  sentences: {
    globalInitial:
      'Between {startYear} and {endYear}, <strong>global</strong> forests emitted {totalEmissions}<b>/year</b>, and removed {totalRemovals}<b>/year</b>. This represents a net carbon flux of {totalFlux}<b>/year</b>.',
    globalWithIndicator:
      'Between {startYear} and {endYear}, <strong>global</strong> forests within {indicator} emitted {totalEmissions}<b>/year</b>, and removed {totalRemovals}<b>/year</b>. This represents a net carbon flux of {totalFlux}<b>/year</b>.',
    initial:
      'Between {startYear} and {endYear}, forests in {location} emitted {totalEmissions}<strong>/year</strong>, and removed {totalRemovals}<strong>/year</strong>. This represents a net carbon flux of {totalFlux}<strong>/year</strong>.',
    withIndicator:
      'Between {startYear} and {endYear}, forests within {indicator}, {location} emitted {totalEmissions}<b>/year</b>, and removed {totalRemovals}<b>/year</b>. This represents a net carbon flux of {totalFlux}<b>/year</b>.',
  },
  customComponent: 'CarbonFlux',
  settings: {
    threshold: 30,
    includesGainPixels: true,
    startYear: 2001,
    endYear: 2020,
  },
  whitelists: {},
  getData: (params) => {
    if (shouldQueryPrecomputedTables(params)) {
      return getCarbonFlux(params).then((flux) => {
        if (!flux || !flux.length) return [];
        return flux;
      });
    }
    // use OTF
    const geostoreId = params?.geostore?.hash;
    return getCarbonFluxOTF({
      ...params,
      geostoreId,
      staticStatement: {
        // overrides tables and/or sql
        table: 'gfw_forest_carbon_net_flux',
      },
    }).then((flux) => {
      if (!flux || !flux.length) return [];
      return flux;
    });
  },
  getDataURL: (params) => [getCarbonFlux({ ...params, download: true })],
  getWidgetProps,
};
