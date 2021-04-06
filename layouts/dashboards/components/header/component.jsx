import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Link from 'next/link';
import { trackEvent } from 'utils/analytics';

import { Row, Column } from 'gfw-components';

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
    location: PropTypes.object.isRequired,
    forestAtlasLink: PropTypes.object,
    sentence: PropTypes.object,
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

  render() {
    const {
      className,
      adm0s,
      adm1s,
      adm2s,
      handleLocationChange,
      loading,
      setShareModal,
      locationNames,
      shareData,
      location,
      forestAtlasLink,
      sentence,
      selectorMeta,
      shareMeta,
      setAreaOfInterestModalSettings,
      title,
      activeArea,
      firstArea,
    } = this.props;
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
        <Row>
          <Column width={[1, 5 / 6]}>
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
              {adm0s && (
                <Dropdown
                  theme="theme-dropdown-dark"
                  placeholder={`Select ${selectorMeta.typeVerb}`}
                  noItemsFound={`No ${selectorMeta.typeName} found`}
                  noSelectedValue={`Select ${selectorMeta.typeName}`}
                  value={locationNames.adm0}
                  options={adm0s}
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
              )}
              {isCountryDashboard &&
                location.adm0 &&
                adm0s &&
                adm1s &&
                adm1s.length > 1 && (
                  <Dropdown
                    theme="theme-dropdown-dark"
                    placeholder="Select a region"
                    noItemsFound="No region found"
                    noSelectedValue="Select a region"
                    value={locationNames.adm1}
                    options={adm1s}
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
                location.adm1 &&
                adm1s &&
                adm2s &&
                adm2s.length > 1 && (
                  <Dropdown
                    theme="theme-dropdown-dark"
                    placeholder="Select a region"
                    noItemsFound="No region found"
                    noSelectedValue="Select a region"
                    value={locationNames.adm2}
                    options={adm2s}
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
          </Column>
          {!loading && activeArea && activeArea.userArea && (
            <Column width={[1, 5 / 6]}>
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
            </Column>
          )}
          <Column width={[1, 5 / 6]}>
            <div className="description text -title-xs">
              {!loading && (
                <div>
                  <DynamicSentence
                    testId="dashboard-header-sentence"
                    className="sentence"
                    sentence={sentence}
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
              )}
            </div>
          </Column>
        </Row>
        <AreaOfInterestModal viewAfterSave />
      </div>
    );
  }
}

export default Header;
