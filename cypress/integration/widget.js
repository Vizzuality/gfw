import initSpecFile from '../utils/init-spec-file';

// All tests for widget. Each element collects similar tests which share a single spec key.
const testConfig = [
  {
    title: 'Validates header widget returns correct sentence',
    tests: [
      {
        slug: 'default',
        description:
          'when a country with no forest is selected (ATA) default sentence returns',
        visit: '/dashboards/country/ATA',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {extent} of tree cover, extending over {percentage} of its land area.',
      },
      {
        slug: 'indonesiaIso',
        description:
          'when Indonesia is selected correct sentence template returned',
        visit: '/dashboards/country/IDN',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2001, {location} had {primaryForest} of primary forest*, extending over {percentagePrimaryForest} of its land area. In {year}, it lost {primaryLoss} of primary forest*, equivalent to {emissionsPrimary} of CO₂ of emissions.',
      },
      {
        slug: 'indonesiaAdm1',
        description:
          'when and admin 1 in Indonesia is selected correct sentence template returned',
        visit: '/dashboards/country/IDN/1',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2001, {location} had {primaryForest} of primary forest*, extending over {percentagePrimaryForest} of its land area. In {year}, it lost {primaryLoss} of primary forest*, equivalent to {emissionsPrimary} of CO₂ of emissions.',
      },
      {
        slug: 'indonesiaAdm2',
        description:
          'when an admin 2 in Indonesia is selected correct sentence template returned',
        visit: '/dashboards/country/IDN/1/1',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2001, {location} had {primaryForest} of primary forest*, extending over {percentagePrimaryForest} of its land area. In {year}, it lost {primaryLoss} of primary forest*, equivalent to {emissionsPrimary} of CO₂ of emissions.',
      },
      {
        slug: 'plantationsIso',
        description:
          'when country with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/ESP',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {naturalEmissions} of CO₂ of emissions.',
      },
      {
        slug: 'plantationsAdm1',
        description:
          'when admin 1 with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/ESP/12',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {naturalEmissions} of CO₂ of emissions.',
      },
      {
        slug: 'plantationsAdm2',
        description:
          'when admin 2 with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/ESP/12/1',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {naturalEmissions} of CO₂ of emissions.',
      },
      {
        slug: 'plantationsTropicalIso',
        description:
          'when a tropical country with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/MYS',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {emissions} of CO\u2082 of emissions.',
      },
      {
        slug: 'plantationsTropicalAdm1',
        description:
          'when a tropical admin 1 with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/MYS/14',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {emissions} of CO\u2082 of emissions.',
      },
      {
        slug: 'plantationsTropicalAdm2',
        description:
          'when a tropical admin 2 with plantations is selected correct sentence template returned',
        visit: '/dashboards/country/MYS/14/31',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {naturalForest} of natural forest, extending over {percentage} of its land area. In {year}, it lost {naturalLoss} of natural forest, equivalent to {emissions} of CO\u2082 of emissions.',
      },
      {
        slug: 'lossIso',
        description:
          'when country with tree cover loss is selected correct sentence template returned',
        visit: '/dashboards/country/GUY',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {extent} of tree cover, extending over {percentage} of its land area. In {year}, it lost {loss} of tree cover',
      },
      {
        slug: 'lossAdm1',
        description:
          'when admin 1 with tree cover loss is selected correct sentence template returned',
        visit: '/dashboards/country/GUY/2',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {extent} of tree cover, extending over {percentage} of its land area. In {year}, it lost {loss} of tree cover',
      },
      {
        slug: 'lossAdm2',
        description:
          'when admin 2 with tree cover loss is selected correct sentence template returned',
        visit: '/dashboards/country/GUY/2/8',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {extent} of tree cover, extending over {percentage} of its land area. In {year}, it lost {loss} of tree cover',
      },
      {
        slug: 'globalInitial',
        description:
          'when global tree cover loss is selected correct sentence template returned',
        visit: '/dashboards/global',
        test: 'dashboard-header-sentence',
        sentence:
          'In 2010, {location} had {extent} of tree cover, extending over {percentage} of its land area. In {year}, it lost {loss} of tree cover.',
      },
      {
        only: true,
        slug: 'my slug',
        description: 'Tree cover loss',
        visit:
          '/embed/widget/treeLossPct/country/IDN/1/?location=WyJjb3VudHJ5IiwiSUROIiwiMSJd&widget=treeLossPct',
        test: 'sentence-treeLossPct',
        chart: '.recharts-wrapper',
        sentence:
          'From 2002 to 2019, Aceh lost 267kha of humid primary forest, making up 40% of its total tree cover loss in the same time period. Total area of humid primary forest in Aceh decreased by 7.9% in this time period.',
      },
    ],
    spec: {
      test: (sheet) => {
        cy.visit(sheet.visit, {
          timeout: 100000,
          retryOnStatusCodeFailure: true,
        });

        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);

        cy.isValidSentence(sheet.test, sheet.sentence);

        if ('chart' in sheet) {
          cy.get(sheet.chart).toMatchImageSnapshot({
            imageConfig: {
              threshold: 0.001,
            },
          });
        }
      },
    },
  },
];

initSpecFile('Widgets spec', testConfig);
