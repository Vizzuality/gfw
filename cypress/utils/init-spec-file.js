const asSlug = (s) => s.trim().toLowerCase().replace(/\s/g, '_');

function initSpec(title, testConfig, locked = false) {
  describe(title, () => {
    const xhrData = [];
    after(() => {
      // In record mode, save gathered XHR data to local JSON file
      if (Cypress.env('RECORD') && !locked) {
        const path = `./cypress/fixtures/${asSlug(title)}.json`;
        cy.writeFile(path, xhrData); // eslint-disable-line
      }
    });

    beforeEach(() => {
      cy.server({
        onResponse: (response) => {
          // If we are in "record mode", push requests we are spying on into memory
          // these will later be stored as a fixture
          if (Cypress.env('RECORD') && !locked) {
            const url = response.url; // eslint-disable-line
            const method = response.method; // eslint-disable-line
            const data = response?.response?.body; // eslint-disable-line
            if (!xhrData.find((x) => x.url === url)) {
              xhrData.push({ url, method, data });
            }
          }
        },
      });

      // This tells Cypress to hook into any GET request we specify bellow
      // Its IMPORTANT not to spy on all requests, you will end up with a HUGE file that will crash the world
      // Ex; recording all requests fileSize 100mb+
      // Ex; specifying spyOn requests fileSize: 4mb ish
      if (Cypress.env('RECORD') && !locked) {
        cy.route({
          method: 'GET',
          url: '/pages/data-scripts/*',
        });
        cy.route({
          method: 'GET',
          url: '/query/*',
        });
        cy.route({
          method: 'GET',
          url: '/api/v2/**',
        });
        cy.route({
          method: 'GET',
          url: '/v1/dataset/**',
        });
        // OTF endpoint
        cy.route({
          method: 'GET',
          url: '/analysis/zonal/**',
        });
      }

      // When we are not recording, read our generated fixture for specified requests
      if (!Cypress.env('RECORD') || locked) {
        cy.route('POST', '/j/**', []).as('ANALYTICS_REQUEST');
        cy.route(
          {
            method: 'GET',
            url: '/v2/geostore/**',
          },
          []
        ).as('GEOSTORE');

        cy.fixture(asSlug(title)).then((data) => {
          for (let i = 0, { length } = data; i < length; i += 1) {
            // eslint-disable-line
            cy.route(data[i].method, data[i].url, data[i].data); // eslint-disable-line
          }
        });
      }
    });
    testConfig.forEach((testGroup) => {
      describe(testGroup.title, () => {
        const { spec } = testGroup;
        testGroup.tests.forEach((test) => {
          it(test.description, () => {
            spec.test(test);
          });
        });
      });
    });
  });
}

export default (title, tests) => initSpec(title, tests);
