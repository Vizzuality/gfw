import {
  TREE_PLANTATIONS_DATASET,
  INTACT_FOREST_LANDSCAPES_DATASET,
  PRIMARY_FOREST_DATASET,
  MANGROVE_FORESTS_DATASET
} from './layers-datasets';
import {
  TREE_PLANTATIONS,
  INTACT_FOREST_LANDSCAPES,
  PRIMARY_FOREST,
  MANGROVE_FORESTS
} from './layers';

export default [
  {
    label: 'Plantations',
    value: 'plantations',
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
      'Recently Cleared'
    ],
    datasets: [
      {
        dataset: TREE_PLANTATIONS_DATASET,
        layers: [TREE_PLANTATIONS]
      }
    ]
  },
  {
    label: 'Intact Forest Landscapes ({iflYear})',
    value: 'ifl',
    tableKeys: {
      annual: 'intact_forest_landscape__year',
      glad: 'is__intact_forest_landscapes_2016',
      viirs: 'is__intact_forest_landscapes_2016',
      modis: 'is__intact_forest_landscapes_2016'
    },
    metaKey: 'intact_forest_landscapes_change',
    global: true,
    default: 2016,
    comparison: '>=',
    categories: [2016, 2000],
    datasets: [
      {
        dataset: INTACT_FOREST_LANDSCAPES_DATASET,
        layers: [INTACT_FOREST_LANDSCAPES]
      }
    ]
  },
  {
    label: 'Primary Forests (2001, tropics only)',
    value: 'primary_forest',
    tableKey: 'is__umd_regional_primary_forest_2001',
    metaKey: 'regional_primary_forests',
    global: true,
    datasets: [
      {
        dataset: PRIMARY_FOREST_DATASET,
        layers: [PRIMARY_FOREST]
      }
    ]
  },
  {
    label: 'Mangrove forests',
    value: 'mangroves_2016',
    tableKey: 'is__gmw_mangroves_2016',
    metaKey: 'mangrove_2010_gmw',
    global: true,
    datasets: [
      {
        dataset: MANGROVE_FORESTS_DATASET,
        layers: [MANGROVE_FORESTS]
      }
    ],
    hidden: false
  },
  {
    label: 'Tree cover loss driver category',
    value: 'tsc',
    tableKey: 'tsc_tree_cover_loss_drivers__type',
    hidden: true
  }
];
