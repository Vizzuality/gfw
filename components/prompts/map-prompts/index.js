import { createElement, PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import reducerRegistry from 'redux/registry';

import { A } from 'gfw-components';

import { setAnalysisSettings } from 'components/analysis/actions';
import { setMenuSettings } from 'components/map-menu/actions';
import { setMainMapSettings } from 'layouts/map/actions';

import { BIOMASS_LOSS_DATASET } from 'data/datasets';

import * as actions from './actions';
import reducers, { initialState } from './reducers';
import Component from './component';
import { getMapPromptsProps } from './selectors';

class MapPromptsContainer extends PureComponent {
  componentDidUpdate(prevProps) {
    const {
      mapZoom,
      setMapPromptsSettings,
      recentActive,
      showPrompts,
      activeCategories,
      datasetIds,
      shouldShowPlanetPrompt,
    } = this.props;
    const shouldOpenRecentImageryPrompt =
      showPrompts &&
      !recentActive &&
      // if map zooms past 9
      mapZoom > 9 &&
      prevProps.mapZoom <= 9;

    const shouldOpenAnalysisPrompt =
      showPrompts &&
      // if map zooms past 9
      mapZoom > 3 &&
      prevProps.mapZoom <= 3 &&
      activeCategories &&
      (activeCategories.includes('landUse') ||
        activeCategories.includes('biodiversity') ||
        datasetIds.includes(BIOMASS_LOSS_DATASET));

    if (shouldShowPlanetPrompt) {
      setMapPromptsSettings({
        open: true,
        force: true,
        stepsKey: 'planetBasemapTour',
        stepIndex: 0,
      });
    }

    if (shouldOpenRecentImageryPrompt) {
      setMapPromptsSettings({
        open: true,
        stepsKey: 'recentImagery',
        stepIndex: 0,
      });
    }

    if (shouldOpenAnalysisPrompt) {
      setMapPromptsSettings({
        open: true,
        stepsKey: 'analyzeAnArea',
        stepIndex: 0,
      });
    }
  }

  getStepsData = () => {
    const { stepsKey } = this.props;
    const {
      setMapPromptsSettings,
      setAnalysisView,
      clearAnalysisView,
    } = this.props;

    const allSteps = {
      planetBasemapTour: {
        title: 'Planet basemaps',
        steps: [
          {
            disableBeacon: true,
            bypassUserDisableTips: true,
            target: '.basemaps-btn',
            content: (
              <>
                Visit the
                {' '}
                <A
                  href="https://www.planet.com/nicfi/"
                  target="__BLANK"
                  rel="noreferrer noopener"
                >
                  Planet website
                </A>
                {' '}
                to register for a free account and to download mosaics
              </>
            ),
            actions: {
              onClose: () => {
                localStorage.setItem('seenPlanetPrompt', true);
                this.resetPrompts();
              },
            },
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      mapTour: {
        title: 'Map tour',
        steps: [
          {
            target: '.map-tour-data-layers',
            content: 'Explore available data layers',
            disableBeacon: true,
            placement: 'right',
            actions: {
              prev: () => {
                this.resetMapLayout();
              },
            },
          },
          {
            target: '.map-tour-legend',
            placement: 'right',
            disableBeacon: true,
            content:
              'View and change settings for data layers on the map like date range and opacity. Click the "i" icons to learn more about a dataset.',
            actions: {
              next: () => {
                this.props.setMainMapSettings({
                  showAnalysis: true,
                });
              },
            },
          },
          {
            target: '.map-tour-legend',
            placement: 'right',
            disableBeacon: true,
            content:
              'Analyze forest change within your area of interest by clicking a shape on the map or drawing or uploading a shape.',
            actions: {
              next: () => {
                this.props.setMenuSettings({
                  menuSection: 'explore',
                });
              },
              prev: () => {
                this.props.setMainMapSettings({
                  showAnalysis: false,
                });
              },
              learnHow: () => {
                this.resetPrompts();
                setTimeout(() => {
                  setMapPromptsSettings({
                    open: true,
                    stepsKey: 'analyzeAnAreaTour',
                    stepIndex: 0,
                    force: true,
                  });
                }, 100);
              },
            },
          },
          {
            target: '.map-tour-menu-panel',
            placement: 'right',
            disableBeacon: true,
            content:
              'Explore data related to important forest topics, Places to Watch (high priority areas with recent forest loss), and stories about forests.',
            actions: {
              next: () => {
                this.props.setMenuSettings({
                  menuSection: 'search',
                });
              },
              prev: () => {
                this.props.setMenuSettings({
                  menuSection: '',
                });
              },
            },
          },
          {
            target: '.map-tour-menu-panel',
            placement: 'right',
            disableBeacon: true,
            content:
              'Search for a dataset, location or geographic coordinates.',
            actions: {
              next: () => {
                this.props.setMenuSettings({
                  menuSection: '',
                });
                this.props.setMainMapSettings({
                  showBasemaps: true,
                });
              },
              prev: () => {
                this.props.setMenuSettings({
                  menuSection: 'explore',
                });
              },
            },
          },
          {
            target: '.map-tour-basemaps',
            content:
              'Customize the basemap, including the boundaries displayed and the color of the labels.',
            disableBeacon: true,
            actions: {
              next: () => {
                this.props.setMainMapSettings({
                  showBasemaps: false,
                });
              },
              prev: () => {
                this.props.setMenuSettings({
                  menuSection: 'search',
                });
                this.props.setMainMapSettings({
                  showBasemaps: false,
                });
              },
            },
          },
          {
            target: '.map-tour-recent-imagery',
            content:
              'View recent satellite imagery, searchable by date and cloud cover.',
            disableBeacon: true,
            actions: {
              prev: () => {
                this.props.setMainMapSettings({
                  showBasemaps: true,
                });
              },
              learnHow: () => {
                this.resetPrompts();
                setTimeout(() => {
                  this.props.setMapPromptsSettings({
                    open: true,
                    stepsKey: 'recentImageryTour',
                    stepIndex: 0,
                    force: true,
                  });
                }, 100);
              },
            },
          },
          {
            target: '.map-tour-map-controls',
            disableBeacon: true,
            content:
              'Access basic map tools: zoom out and in, expand the map, share or embed, print, and take a tour of the map. Also view zoom level and lat/long coordinates.',
          },
          {
            target: '.map-tour-main-menu',
            content: 'Access the main navigation menu.',
            disableBeacon: true,
          },
        ],
      },
      recentImagery: {
        title: 'Recent Satellite Imagery',
        steps: [
          {
            target: '.recent-imagery-btn',
            content:
              'Display recent satellite imagery over an area, filtered by date and cloud cover.',
            disableBeacon: true,
            actions: {
              learnHow: () => {
                this.resetPrompts();
                setTimeout(() => {
                  this.props.setMapPromptsSettings({
                    open: true,
                    stepsKey: 'recentImageryTour',
                    stepIndex: 0,
                    force: true,
                  });
                }, 100);
              },
            },
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      analyzeAnArea: {
        title: 'Analyze an Area of Interest',
        steps: [
          {
            target: '.c-data-analysis-menu',
            placement: 'right',
            content:
              'Analyze forest change within your area of interest by clicking a shape on the map or drawing or uploading a shape.',
            disableBeacon: true,
            actions: {
              prev: () => {
                this.props.setMainMapSettings({
                  showAnalysis: true,
                });
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
              },
              learnHow: () => {
                this.resetPrompts();
                setTimeout(() => {
                  setMapPromptsSettings({
                    open: true,
                    stepsKey: 'analyzeAnAreaTour',
                    stepIndex: 0,
                    force: true,
                  });
                }, 100);
              },
            },
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      recentImageryTour: {
        title: 'Recent Satellite Imagery',
        steps: [
          {
            target: '.prompts-recent-imagery',
            content:
              'The map will automatically fetch the most recent satellite image with the least amount of cloud cover for your targeted area.',
            disableBeacon: true,
            placement: 'left',
            actions: {
              returnToTour: () => {
                this.resetPrompts();
                setTimeout(() => {
                  this.props.setMapPromptsSettings({
                    open: true,
                    stepsKey: 'mapTour',
                    stepIndex: 6,
                    force: true,
                  });
                }, 100);
              },
              prev: () => {
                this.props.setMainMapSettings({ showRecentImagery: true });
              },
            },
          },
          {
            target: '.top-section',
            content:
              'Change the settings like the Acquisition Date and Cloud Cover Percentage to filter the available images. Click on a thumbnail to overlay that image on the map. They are ordered by date (most recent first). You can see the date of an image by hovering over it.',
            disableBeacon: true,
            placement: 'left',
          },
          {
            target: '.map-icon-crosshair',
            content:
              'Move the map to align the crosshair icon on the map outside of the image to load a new tile image  in a different area.',
            disableBeacon: true,
            placement: 'left',
          },
        ],
      },
      analyzeAnAreaTour: {
        title: 'Analyze an Area',
        steps: [
          {
            target: '.analysis-boundary-menu',
            content:
              'For a one click analysis, first choose your preferred map boundaries (political boundaries, river basins, ecoregions). Then click on a shape on the map and the analysis will be performed.',
            disableBeacon: true,
            placement: 'right',
            actions: {
              returnToTour: () => {
                this.resetPrompts();
                setTimeout(() => {
                  this.props.setMapPromptsSettings({
                    open: true,
                    stepsKey: 'mapTour',
                    stepIndex: 2,
                    force: true,
                  });
                }, 100);
              },
              prev: () => {
                this.props.setMainMapSettings({
                  showAnalysis: true,
                });
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
              },
            },
          },
          {
            target: '.draw-upload-tab',
            content:
              'To draw a shape, click the Draw or Upload Shape tab and click Start Drawing. Click on the map, move the mouse, and click again until you form your desired shape. Once the shape is fully connected, the analysis will be performed.',
            disableBeacon: true,
            placement: 'right',
            actions: {
              next: () => {
                this.props.setAnalysisSettings({
                  showDraw: true,
                });
              },
              prev: () => {
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
              },
            },
          },
          {
            target: '.draw-menu-input',
            content:
              'To upload a shape, click Pick a File or Drop One Here and select your desired shapefile. Once uploaded, the shape will appear on the map and the analysis will be performed.',
            disableBeacon: true,
            placement: 'right',
          },
        ],
      },
      areaOfInterestTour: {
        title: 'Create an area of interest',
        steps: [
          {
            target: '.subnav-link-analysis',
            content:
              'Click the Analysis tab, where you can upload or draw or a custom shape on the map.',
            disableBeacon: true,
            placement: 'right',
            actions: {
              prev: () => {
                this.props.setMainMapSettings({
                  showAnalysis: false,
                });
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
                clearAnalysisView();
              },
              next: () => {
                this.props.setMainMapSettings({
                  showAnalysis: true,
                });
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
              },
            },
          },
          {
            target: '.draw-upload-tab',
            content:
              'Zoom the map to your desired location and click this button to draw or upload a shape. An analysis will be automatically triggered after you finish.',
            disableBeacon: true,
            placement: 'right',
            actions: {
              prev: () => {
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
                this.props.setMainMapSettings({
                  showAnalysis: false,
                });
              },
            },
          },
          {
            target: '.analysis-boundary-menu',
            content:
              'Alternatively, you can click anywhere on the map to prompt an analysis on that area. You can analyze countries and regions (political boundaries) as well as river basins and terrestrial ecoregions. Let’s perform an analysis on a country, for example.',
            disableBeacon: true,
            placement: 'right',
            delay: 3000,
            actions: {
              prev: () => {
                this.props.setMainMapSettings({
                  showAnalysis: true,
                });
                this.props.setAnalysisSettings({
                  showDraw: false,
                });
                clearAnalysisView();
              },
              next: () => {
                setAnalysisView({ type: 'country', adm0: 'BRA' });
              },
            },
          },
          {
            target: '.analysis-actions',
            delay: 600,
            content:
              'After you perform an analysis on any area, click on the Save in My GFW button to save the area for future reference.',
            disableBeacon: true,
            placement: 'right',
            prev: () => {
              clearAnalysisView();
            },
          },
        ],
      },
      topicsClimate: {
        title: 'Climate',
        steps: [
          {
            target: '.map-icon-crosshair',
            content:
              'Click on a tropical country to calculate emissions from forest loss.',
            disableBeacon: true,
            placement: 'top',
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      topicsCommodities: {
        title: 'Commodities',
        steps: [
          {
            target: '.map-icon-crosshair',
            content:
              'Zoom in to click on a concession and calculate tree cover loss.',
            disableBeacon: true,
            placement: 'top',
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      topicsWater: {
        title: 'Water',
        steps: [
          {
            target: '.map-icon-crosshair',
            content:
              'Click on any of the watershed boundaries on the map to calculate forest change.',
            disableBeacon: true,
            placement: 'top',
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
      subscribeToArea: {
        title: 'Subscribe to alerts',
        steps: [
          {
            target: '.subscribe-btn',
            content:
              'Did you know you can subscribe to receive email updates when new forest change is detected in this area?',
            disableBeacon: true,
            placement: 'right',
          },
        ],
        settings: {
          disableOverlay: true,
        },
      },
    };

    return allSteps[stepsKey];
  };

  resetMapLayout = () => {
    this.props.setMainMapSettings({
      showAnalysis: false,
      showRecentImagery: false,
    });
    this.props.setMenuSettings({ menuSection: '' });
  };

  resetPrompts = () => {
    this.props.setMapPromptsSettings({
      open: false,
      stepIndex: 0,
      stepsKey: '',
      force: true,
    });
  };

  handleShowPrompts = (showPrompts) => {
    this.props.setShowMapPrompts(showPrompts);
  };

  render() {
    return createElement(Component, {
      ...this.props,
      data: this.getStepsData(),
      handleShowPrompts: this.handleShowPrompts,
    });
  }
}

MapPromptsContainer.propTypes = {
  setMainMapSettings: PropTypes.func,
  setMenuSettings: PropTypes.func,
  setMapPromptsSettings: PropTypes.func,
  setAnalysisSettings: PropTypes.func,
  setShowMapPrompts: PropTypes.func,
  stepsKey: PropTypes.string,
  mapZoom: PropTypes.number,
  recentActive: PropTypes.bool,
  showPrompts: PropTypes.bool,
  shouldShowPlanetPrompt: PropTypes.bool,
  activeCategories: PropTypes.array,
  datasetIds: PropTypes.array,
  setAnalysisView: PropTypes.func,
  clearAnalysisView: PropTypes.func,
};

reducerRegistry.registerModule('mapPrompts', {
  actions,
  reducers,
  initialState,
});

export default connect(getMapPromptsProps, {
  ...actions,
  setMainMapSettings,
  setMenuSettings,
  setAnalysisSettings,
})(MapPromptsContainer);
