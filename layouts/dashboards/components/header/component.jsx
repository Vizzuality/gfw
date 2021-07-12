import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Link from 'next/link';
import isEmpty from 'lodash/isEmpty';

import { trackEvent } from 'utils/analytics';

import Dropdown from 'components/ui/dropdown';
import Loader from 'components/ui/loader';
import Icon from 'components/ui/icon';
import Button from 'components/ui/button';
import DynamicSentence from 'components/ui/dynamic-sentence';
import AreaOfInterestModal from 'components/modals/area-of-interest';

import editIcon from 'assets/icons/edit.svg?sprite';
import dashboardIcon from 'assets/icons/dashboard.svg?sprite';
import tagIcon from 'assets/icons/tag.svg?sprite';
import downloadIcon from 'assets/icons/download.svg?sprite';
import saveUserIcon from 'assets/icons/save-user.svg?sprite';
import subscribedIcon from 'assets/icons/subscribed.svg?sprite';
import arrowIcon from 'assets/icons/arrow-down.svg?sprite';
import './styles.scss';

class Header extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    loading: PropTypes.bool,
    locationNames: PropTypes.object.isRequired,
    adm0s: PropTypes.array,
    adm1s: PropTypes.array,
    adm2s: PropTypes.array,
    handleLocationChange: PropTypes.func.isRequired,
    setShareModal: PropTypes.func.isRequired,
    shareData: PropTypes.object.isRequired,
    handleSSRLocation: PropTypes.object,
    location: PropTypes.object.isRequired,
    forestAtlasLink: PropTypes.object,
    sentence: PropTypes.object,
    globalSentence: PropTypes.object,
    downloadLink: PropTypes.string,
    selectorMeta: PropTypes.object,
    shareMeta: PropTypes.string,
    setAreaOfInterestModalSettings: PropTypes.func,
    title: PropTypes.string,
    activeArea: PropTypes.object,
    firstArea: PropTypes.object,
  };

  renderAreaActions({ isCountryDashboard, isAreaAndCountryDashboard }) {
    const {
      downloadLink,
      locationNames,
      setAreaOfInterestModalSettings,
      activeArea,
      location,
    } = this.props;

    const btnTheme = cx(
      'theme-button-clear theme-button-clear-underline theme-button-small'
    );
    return (
      <Dropdown
        layout="overflow-menu"
        className="edit-button"
        onChange={this.handleAreaActions}
        theme={cx('theme-button-medium theme-dropdown-no-border small square')}
        options={[
          {
            value: 'open_map',
            component: (
              <Button
                theme={btnTheme}
                link={activeArea && `/map/aoi/${activeArea.id}`}
              >
                <Icon icon={dashboardIcon} />
                Open Map
              </Button>
            ),
          },
          activeArea &&
            activeArea.userArea && {
              value: 'edit_area',
              component: (
                <Button
                  theme={btnTheme}
                  tooltip={{
                    text: `Edit ${
                      locationNames &&
                      locationNames.adm0 &&
                      locationNames.adm0.label
                    }`,
                    position: 'bottom',
                  }}
                  onClick={() => setAreaOfInterestModalSettings(activeArea.id)}
                >
                  <Icon icon={editIcon} />
                  Edit area
                </Button>
              ),
            },
          location?.type === 'country' && {
            value: 'save_area',
            component: (
              <Button
                theme={btnTheme}
                tooltip={{
                  text: 'Save as an area of interest',
                  position: 'bottom',
                }}
                onClick={() => setAreaOfInterestModalSettings(true)}
              >
                <Icon icon={saveUserIcon} />
                Save area
              </Button>
            ),
          },
          (isCountryDashboard || isAreaAndCountryDashboard) && {
            value: 'download_data',
            component: (
              <Button
                theme={btnTheme}
                extLink={downloadLink}
                tooltip={{
                  text: `Download the data${
                    locationNames.adm0
                      ? ` for ${
                          locationNames &&
                          locationNames.adm0 &&
                          locationNames.adm0.label
                        }`
                      : ''
                  }`,
                  position: 'bottom',
                }}
                onClick={() => {
                  trackEvent({
                    category: 'Dashboards page',
                    action: 'Download page',
                    label:
                      (locationNames &&
                        locationNames.adm0 &&
                        locationNames.adm0.label) ||
                      'Global',
                  });
                }}
              >
                <Icon icon={downloadIcon} />
                Download data
              </Button>
            ),
          },
        ]}
      />
    );
  }

  getCountrySelectorData() {
    const { locationNames, adm0s, handleSSRLocation } = this.props;

    return {
      value: locationNames?.adm0 || handleSSRLocation?.adm0,
      options:
        adm0s?.length > 0 ? adm0s : handleSSRLocation?.countryData?.countries,
    };
  }

  getAdm1SelectorData() {
    const { locationNames, adm1s, handleSSRLocation } = this.props;

    return {
      value: locationNames?.adm1 || handleSSRLocation?.adm1,
      options:
        adm1s?.length > 0 ? adm1s : handleSSRLocation?.countryData?.regions,
    };
  }

  getAdm2SelectorData() {
    const { locationNames, adm2s, handleSSRLocation } = this.props;

    return {
      value: locationNames?.adm2 || handleSSRLocation?.adm2,
      options:
        adm2s?.length > 0 ? adm2s : handleSSRLocation?.countryData?.subRegions,
    };
  }

  render() {
    const {
      className,
      handleLocationChange,
      loading,
      setShareModal,
      shareData,
      location: runtimeLocation,
      handleSSRLocation,
      forestAtlasLink,
      globalSentence,
      sentence,
      selectorMeta: runtimeSelectorMeta,
      shareMeta,
      setAreaOfInterestModalSettings,
      title,
      activeArea,
      firstArea,
    } = this.props;

    const location = isEmpty(runtimeLocation)
      ? handleSSRLocation
      : runtimeLocation;
    let selectorMeta;
    if (isEmpty(runtimeLocation)) {
      selectorMeta = {
        typeVerb: 'country',
        typeName: 'country',
      };
    } else {
      selectorMeta = runtimeSelectorMeta;
    }

    const isCountryDashboard =
      location?.type === 'country' || location?.type === 'global';
    const isAreaDashboard = location?.type === 'aoi';
    const isAreaAndCountryDashboard =
      !isCountryDashboard &&
      activeArea &&
      activeArea.admin &&
      activeArea.admin.adm0;
    const showMetaControls =
      !loading && (!isAreaDashboard || (isAreaDashboard && activeArea));
    const { tags } = activeArea || {};

    const displaySentence =
      !sentence || isEmpty(sentence) ? globalSentence : sentence;

    const countrySelectorData = this.getCountrySelectorData();
    const regionData = this.getAdm1SelectorData();
    const subRegionData = this.getAdm2SelectorData();

    return (
      <div className={cx('c-dashboards-header', className)}>
        {loading && <Loader className="loader" theme="theme-loader-light" />}
        {showMetaControls && (
          <div className="share-buttons">
            <Button
              className="area-share theme-button-small"
              onClick={() => {
                if (activeArea && !activeArea.userArea) {
                  setAreaOfInterestModalSettings(true);
                } else {
                  setShareModal(shareData);
                }
              }}
            >
              {shareMeta}
            </Button>
            {this.renderAreaActions({
              isCountryDashboard,
              isAreaAndCountryDashboard,
            })}
          </div>
        )}
        <div className="row">
          <div className="columns small-12 medium-10">
            <div className="select-container">
              {isAreaDashboard && (
                <Link
                  href="/dashboards/[[...location]]"
                  as="/dashboards/global"
                >
                  <a className="breadcrumb-link">
                    <button
                      onClick={() =>
                        trackEvent({
                          category: 'Areas of interest',
                          action:
                            'User changes between global and areas dashboard',
                          label: 'changes to global',
                        })}
                    >
                      <Icon icon={arrowIcon} className="breadcrumb-icon" />
                      Go to Global dashboard
                    </button>
                  </a>
                </Link>
              )}
              {isCountryDashboard && !!firstArea && (
                <Link
                  href="/dashboards/[[...location]]"
                  as={`/dashboards/aoi/${firstArea.id}`}
                >
                  <a className="breadcrumb-link">
                    <button
                      onClick={() =>
                        trackEvent({
                          category: 'Areas of interest',
                          action:
                            'User changes between global and areas dashboard',
                          label: 'changes to areas',
                        })}
                    >
                      <Icon icon={arrowIcon} className="breadcrumb-icon" />
                      Go to Areas dashboard
                    </button>
                  </a>
                </Link>
              )}
              {title && (
                <h3 className={cx({ global: title === 'global' })}>{title}</h3>
              )}
              <Dropdown
                theme="theme-dropdown-dark"
                placeholder={`Select ${selectorMeta.typeVerb}`}
                noItemsFound={`No ${selectorMeta.typeName} found`}
                noSelectedValue={`Select ${selectorMeta.typeName}`}
                value={countrySelectorData.value}
                options={countrySelectorData.options}
                onChange={(adm0) =>
                  handleLocationChange({ adm0: adm0 && adm0.value })}
                searchable
                disabled={loading}
                tooltip={{
                  text: `Choose the ${selectorMeta.typeName} you want to explore`,
                  delay: 1000,
                }}
                arrowPosition="left"
                clearable={isCountryDashboard}
              />
              {isCountryDashboard &&
                countrySelectorData.value &&
                countrySelectorData.options &&
                regionData.options &&
                regionData.options.length > 1 && (
                  <Dropdown
                    theme="theme-dropdown-dark"
                    placeholder="Select a region"
                    noItemsFound="No region found"
                    noSelectedValue="Select a region"
                    value={regionData.value}
                    options={regionData.options}
                    onChange={(adm1) =>
                      handleLocationChange({
                        adm0: location.adm0,
                        adm1: adm1 && adm1.value,
                      })}
                    searchable
                    disabled={loading}
                    tooltip={{
                      text: 'Choose the region you want to explore',
                      delay: 1000,
                    }}
                    arrowPosition="left"
                    clearable
                  />
                )}
              {isCountryDashboard &&
                regionData.value &&
                regionData.options &&
                subRegionData.options &&
                subRegionData.options.length > 1 && (
                  <Dropdown
                    theme="theme-dropdown-dark"
                    placeholder="Select a region"
                    noItemsFound="No region found"
                    noSelectedValue="Select a region"
                    value={subRegionData.value}
                    options={subRegionData.options}
                    onChange={(adm2) =>
                      handleLocationChange({
                        adm0: location.adm0,
                        adm1: location.adm1,
                        adm2: adm2 && adm2.value,
                      })}
                    searchable
                    disabled={loading}
                    tooltip={{
                      text: 'Choose the region you want to explore',
                      delay: 1000,
                    }}
                    arrowPosition="left"
                    clearable
                  />
                )}
            </div>
          </div>
          {!loading && activeArea && activeArea.userArea && (
            <div className="columns small-12 medium-10">
              <div className="metadata">
                {tags && !!tags.length && (
                  <div className="tags">
                    <Icon icon={tagIcon} className="tag-icon" />
                    <p>{tags.join(', ')}</p>
                  </div>
                )}
                {(activeArea.deforestationAlerts ||
                  activeArea.monthlySummary ||
                  activeArea.fireAlerts) && (
                  <div className="subscribed">
                    <Icon icon={subscribedIcon} className="subscribed-icon" />
                    <p>Subscribed</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="columns small-12 medium-10">
            <div className="description text -title-xs">
              <div>
                <DynamicSentence
                  testId="dashboard-header-sentence"
                  className="sentence"
                  sentence={displaySentence}
                />
                {location && location.adm0 === 'IDN' && (
                  <Fragment>
                    <p className="disclaimer">
                      *Primary forest is defined as mature natural humid
                      tropical forest that has not been completely cleared and
                      regrown in recent history.
                    </p>
                  </Fragment>
                )}
                {forestAtlasLink && isCountryDashboard && (
                  <Button
                    className="forest-atlas-btn"
                    extLink={forestAtlasLink.url}
                  >
                    EXPLORE FOREST ATLAS
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        <AreaOfInterestModal viewAfterSave />
      </div>
    );
  }
}

export default Header;
