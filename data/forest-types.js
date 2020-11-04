import {
  TREE_PLANTATIONS_DATASET,
  INTACT_FOREST_LANDSCAPES_DATASET,
  PRIMARY_FOREST_DATASET,
  MANGROVE_FORESTS_DATASET,
} from 'data/datasets';
import {
  TREE_PLANTATIONS,
  INTACT_FOREST_LANDSCAPES,
  PRIMARY_FOREST,
  MANGROVE_FORESTS,
} from 'data/layers';

export default [
  {
    label: 'Plantations',
    value: 'plantations',
    dataType: 'keyword',
    tableKey: 'gfw_plantation__type',
    metaKey: 'gfw_plantations',
    global: true,
    categories: [
      'Unknown',
      'Wood fiber / Timber',
      'Oil Palm ',
      'Fruit',
      'Rubber',
      'Other',
      'Fruit Mix',
      'Unknown Mix',
      'Oil Palm Mix',
      'Rubber Mix',
      'Wood fiber / Timber Mix',
      'Recently Cleared',
    ],
    datasets: [
      {
        dataset: TREE_PLANTATIONS_DATASET,
        layers: [TREE_PLANTATIONS],
      },
    ],
  },
  {
    label: 'Intact Forest Landscapes ({iflYear})',
    value: 'ifl',
    dataType: 'number',
    tableKeys: {
      annual: 'ifl_intact_forest_landscape__year',
      glad: 'is__ifl_intact_forest_landscape_2016',
      viirs: 'is__ifl_intact_forest_landscape_2016',
      modis: 'is__ifl_intact_forest_landscape_2016',
    },
    metaKey: 'intact_forest_landscapes_change',
    global: true,
    default: 2016,
    comparison: '>=',
    categories: [2016, 2000],
    datasets: [
      {
        dataset: INTACT_FOREST_LANDSCAPES_DATASET,
        layers: [INTACT_FOREST_LANDSCAPES],
      },
    ],
  },
  {
    label: 'Primary Forests (2001, tropics only)',
    value: 'primary_forest',
    dataType: 'keyword',
    tableKey: 'is__umd_regional_primary_forest_2001',
    metaKey: 'regional_primary_forests',
    global: true,
    datasets: [
      {
        dataset: PRIMARY_FOREST_DATASET,
        layers: [PRIMARY_FOREST],
      },
    ],
  },
  {
    label: 'Mangrove forests',
    value: 'mangroves_2016',
    dataType: 'number',
    tableKey: 'is__gmw_mangroves_2016',
    metaKey: 'mangrove_2010_gmw',
    global: true,
    datasets: [
      {
        dataset: MANGROVE_FORESTS_DATASET,
        layers: [MANGROVE_FORESTS],
      },
    ],
    hidden: false,
  },
  {
    label: 'Tree cover loss driver category',
    value: 'tsc',
    dataType: 'keyword',
    tableKey: 'tsc_tree_cover_loss_drivers__type',
    hidden: true,
  },
];
