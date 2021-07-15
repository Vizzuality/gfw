import forestChangeIcon from 'assets/icons/forest-change.svg?sprite';
import landCoverIcon from 'assets/icons/land-cover.svg?sprite';
import landUseIcon from 'assets/icons/land-use.svg?sprite';
import climateIcon from 'assets/icons/climate.svg?sprite';
import biodiversityIcon from 'assets/icons/biodiversity.svg?sprite';
import testIcon from 'assets/icons/crosshair.svg?sprite';
import exploreIcon from 'assets/icons/explore.svg?sprite';
import layersIcon from 'assets/icons/layers.svg?sprite';
import globeIcon from 'assets/icons/globe.svg?sprite';
import analysisIcon from 'assets/icons/analysis.svg?sprite';
import searchIcon from 'assets/icons/search.svg?sprite';
import compact from 'lodash/compact';

// TODO: leave only one, refactor icon styles
import userIcon from 'assets/icons/user.svg?sprite';
import myGFWIcon from 'assets/icons/mygfw.svg?sprite';

import RecentImagerySettings from 'components/recent-imagery/components/recent-imagery-settings';
import Analysis from 'components/analysis';
import Legend from 'components/map/components/legend';

import Datasets from './components/sections/datasets';
import Explore from './components/sections/explore';
import Search from './components/sections/search';
import MyGFW from './components/sections/my-gfw';

const ENVIRONMENT = process.env.NEXT_PUBLIC_FEATURE_ENV;

export const mobileSections = [
  {
    label: 'layers',
    slug: 'datasets',
    icon: globeIcon,
    Component: Datasets,
  },
  {
    label: 'legend',
    slug: 'legend',
    icon: layersIcon,
    Component: Legend,
    embed: true,
  },
  {
    label: 'analysis',
    slug: 'analysis',
    icon: analysisIcon,
    Component: Analysis,
    embed: true,
  },
  {
    label: 'explore',
    slug: 'explore',
    icon: exploreIcon,
    Component: Explore,
  },
  {
    label: 'my gfw',
    slug: 'my-gfw',
    icon: myGFWIcon,
    Component: MyGFW,
  },
  {
    label: 'Recent Satellite Imagery',
    slug: 'recent-imagery',
    Component: RecentImagerySettings,
    hidden: true,
  },
  {
    label: 'Recent Satellite Imagery',
    slug: 'recent-imagery-collapsed',
    openSection: 'recent-imagery',
    collapsed: true,
    hidden: true,
  },
];

export const searchSections = [
  {
    label: 'explore',
    slug: 'explore',
    icon: exploreIcon,
    Component: Explore,
    large: true,
  },
  {
    label: 'search',
    slug: 'search',
    icon: searchIcon,
    Component: Search,
    large: true,
  },
  {
    label: 'my gfw',
    slug: 'my-gfw',
    icon: userIcon,
    Component: MyGFW,
  },
];

export const datasetsSections = compact([
  {
    label: 'layers',
    slug: 'datasets',
    category: 'forestChange',
    icon: forestChangeIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'deforestationAlerts',
        title: 'Deforestation Alerts',
      },
      {
        slug: 'fireAlerts',
        title: 'Fires',
      },
      {
        slug: 'treeCoverChange',
        title: 'Tree Cover Change',
      },
    ],
  },
  {
    label: 'layers',
    slug: 'datasets',
    category: 'landCover',
    icon: landCoverIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'landCover',
        title: 'Land Cover',
      },
    ],
  },
  {
    label: 'layers',
    slug: 'datasets',
    category: 'landUse',
    icon: landUseIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'concessions',
        title: 'Commodities',
      },
      {
        slug: 'conservation',
        title: 'Conservation',
      },
      {
        slug: 'infrastructure',
        title: 'Infrastructure',
      },
      {
        slug: 'people',
        title: 'People',
      },
    ],
  },
  {
    label: 'layers',
    slug: 'datasets',
    category: 'climate',
    icon: climateIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'carbonEmissions',
        title: 'Carbon Flux',
      },
      {
        slug: 'carbonDensity',
        title: 'Carbon Density',
      },
      {
        slug: 'carbonGains',
        title: 'Potential Carbon Gains',
      },
    ],
  },
  {
    label: 'layers',
    slug: 'datasets',
    category: 'biodiversity',
    icon: biodiversityIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'biodiversity',
        title: 'Biodiversity',
      },
    ],
  },
  ENVIRONMENT === 'staging' && {
    label: 'layers',
    slug: 'datasets',
    category: 'test',
    icon: testIcon,
    Component: Datasets,
    subCategories: [
      {
        slug: 'test',
        title: 'Test Layers',
      },
    ],
  },
]);
