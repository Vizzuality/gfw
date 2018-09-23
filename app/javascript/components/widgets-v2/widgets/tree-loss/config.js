export default {
  widget: 'treeLoss',
  title: 'Tree cover loss in {location}',
  categories: ['summary', 'forest-change'],
  types: ['country'],
  admins: ['country', 'region', 'subRegion'],
  large: true,
  options: {
    forestTypes: ['ifl', 'primary_forest', 'mangrove_2010_gmw'],
    landCategories: true,
    startYears: true,
    endYears: true,
    thresholds: true,
    extentYears: true
  },
  colors: 'loss',
  dataType: 'loss',
  metaKey: 'widget_tree_cover_loss',
  layers: ['loss'],
  sortOrder: {
    summary: 0,
    forestChange: 0
  },
  sentence: {
    initial:
      'From {startYear} to {endYear}, {location} lost {loss} of tree cover, equivalent to a {percent} decrease since {extentYear} and {emissions} of CO\u2082 emissions.',
    withIndicator:
      'From {startYear} to {endYear}, {location} lost {loss} of tree cover in {indicator}, equivalent to a {percent} decrease since {extentYear} and {emissions} of CO\u2082 emissions.',
    noLoss:
      'From {startYear} to {endYear}, {location} lost {loss} of tree cover.',
    noLossWithIndicator:
      'From {startYear} to {endYear}, {location} lost {loss} of tree cover in {indicator}.'
  }
};