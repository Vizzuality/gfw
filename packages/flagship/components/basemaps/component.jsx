/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'components/ui/dropdown';
import cx from 'classnames';

import Icon from 'components/ui/icon';
import Button from 'components/ui/button';

import infoIcon from 'assets/icons/info.svg?sprite';
import closeIcon from 'assets/icons/close.svg?sprite';

import boundariesIcon from 'assets/icons/boundaries.svg?sprite';
import labelsIcon from 'assets/icons/labels.svg?sprite';
import roadsIcon from 'assets/icons/roads.svg?sprite';

import './styles.scss';

class Basemaps extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { showBasemaps: false };
  }

  static propTypes = {
    onClose: PropTypes.func,
    boundaries: PropTypes.array,
    basemaps: PropTypes.object.isRequired,
    labels: PropTypes.array.isRequired,
    labelSelected: PropTypes.object.isRequired,
    landsatYears: PropTypes.array.isRequired,
    selectLabels: PropTypes.func.isRequired,
    selectBasemap: PropTypes.func.isRequired,
    activeBasemap: PropTypes.object.isRequired,
    selectBoundaries: PropTypes.func.isRequired,
    activeBoundaries: PropTypes.object,
    isDesktop: PropTypes.bool,
    getTooltipContentProps: PropTypes.func.isRequired,
    setModalMetaSettings: PropTypes.func,
    roadsSelected: PropTypes.object.isRequired,
    selectRoads: PropTypes.func.isRequired,
    roads: PropTypes.array.isRequired,
    setMapSettings: PropTypes.func,
  };

  renderButtonBasemap(item) {
    const { selectBasemap, isDesktop } = this.props;

    return (
      <button
        className="basemaps-list-item-button"
        onClick={() => {
          if (!isDesktop) {
            this.setState({ showBasemaps: !this.state.showBasemaps });
          }
          selectBasemap({ value: item.value });
        }}
      >
        <div
          className="basemaps-list-item-image"
          style={{
            backgroundImage: `url(${item.image})`,
          }}
        />
        <p className="basemaps-list-item-name">{item.label}</p>
      </button>
    );
  }

  renderLandsatBasemap(item) {
    const {
      selectBasemap,
      activeBasemap,
      landsatYears,
      basemaps,
      isDesktop,
    } = this.props;
    const year = activeBasemap.year || landsatYears[0].value;
    const basemap = basemaps[item.value]
      ? basemaps[item.value]
      : basemaps.landsat;

    return (
      <button
        className="basemaps-list-item-button"
        onClick={() => {
          selectBasemap({
            value: 'landsat',
            year: basemap.defaultYear,
          });
          if (!isDesktop) {
            this.setState({ showBasemaps: !this.state.showBasemaps });
          }
        }}
      >
        <div
          className="basemaps-list-item-image"
          style={{
            backgroundImage: `url(${item.image})`,
          }}
        />
        <span
          className="basemaps-list-item-name"
          onClick={(e) => e.stopPropagation()}
        >
          {item.label}
          <div className="basemaps-list-item-selectors">
            <Dropdown
              className="landsat-selector"
              theme="theme-dropdown-native-inline"
              value={year}
              options={landsatYears}
              onChange={(value) => {
                const selectedYear = parseInt(value, 10);
                selectBasemap({
                  value: 'landsat',
                  year: selectedYear,
                });
                if (!isDesktop) {
                  this.setState({ showBasemaps: !this.state.showBasemaps });
                }
              }}
              native
            />
          </div>
        </span>
      </button>
    );
  }

  renderBasemapsSelector() {
    const { activeBasemap, basemaps, isDesktop } = this.props;
    return (
      <div className="basemaps-bottom-section">
        {isDesktop ? (
          <div className="basemaps-header">
            <h2 className="basemaps-title">MAP STYLES</h2>
          </div>
        ) : (
          <div className="menu-arrow" />
        )}
        <div className="basemap-list-scroll-wrapper">
          <ul className="basemaps-list">
            {Object.values(basemaps).map((item) => {
              let basemapButton = this.renderButtonBasemap(item);
              if (item.value === 'landsat') {
                basemapButton = this.renderLandsatBasemap(item);
              }

              return (
                <li
                  key={item.value}
                  className={cx('basemaps-list-item', {
                    '-active': activeBasemap.value === item.value,
                  })}
                >
                  {basemapButton}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    const {
      onClose,
      labelSelected,
      activeBasemap,
      getTooltipContentProps,
      activeBoundaries,
      selectBoundaries,
      boundaries,
      selectLabels,
      labels,
      isDesktop,
      setModalMetaSettings,
      roadsSelected,
      selectRoads,
      roads,
    } = this.props;

    const selectedBoundaries = activeBoundaries
      ? { label: activeBoundaries.name }
      : boundaries && boundaries[0];
    return (
      <div
        className={cx('c-basemaps', 'map-tour-basemaps')}
        {...getTooltipContentProps()}
      >
        <div className="basemaps-top-section">
          <div className="basemaps-header">
            <h2 className="basemaps-title">Map settings</h2>
            {isDesktop && (
              <div className="basemaps-actions">
                <Button
                  className="info-btn"
                  theme="theme-button-tiny theme-button-grey-filled square"
                  onClick={() => setModalMetaSettings('flagship_basemaps')}
                >
                  <Icon icon={infoIcon} />
                </Button>
                <button className="basemaps-action-button" onClick={onClose}>
                  <Icon icon={closeIcon} />
                </button>
              </div>
            )}
          </div>
          <ul className="basemaps-options-container">
            {!isDesktop && (
              <li className="basemaps-options-wrapper">
                <Button
                  theme="theme-button-dark-round"
                  background={`url(${activeBasemap.image})`}
                  onClick={() =>
                    this.setState({ showBasemaps: !this.state.showBasemaps })}
                >
                  <span className="value">
                    {activeBasemap.label}
                    {activeBasemap.year && ` - ${activeBasemap.year}`}
                  </span>
                </Button>
              </li>
            )}
            <li className="basemaps-options-wrapper">
              <Dropdown
                theme={cx('theme-dropdown-button', {
                  'theme-dropdown-dark-round theme-dropdown-no-border': !isDesktop,
                  'theme-dropdown-dark-squared': isDesktop,
                })}
                value={selectedBoundaries}
                options={boundaries}
                onChange={selectBoundaries}
                selectorIcon={boundariesIcon}
              />
            </li>
            <li className="basemaps-options-wrapper">
              <Dropdown
                theme={cx('theme-dropdown-button', {
                  'theme-dropdown-dark-round theme-dropdown-no-border': !isDesktop,
                  'theme-dropdown-dark-squared': isDesktop,
                })}
                value={labelSelected}
                options={labels}
                onChange={selectLabels}
                selectorIcon={labelsIcon}
              />
            </li>
            <li className="basemaps-options-wrapper">
              <Dropdown
                theme={cx('theme-dropdown-button', {
                  'theme-dropdown-dark-round theme-dropdown-no-border': !isDesktop,
                  'theme-dropdown-dark-squared': isDesktop,
                })}
                className="basemaps-roads"
                value={roadsSelected}
                options={roads}
                onChange={selectRoads}
                selectorIcon={roadsIcon}
              />
            </li>
          </ul>
        </div>
        {(isDesktop || this.state.showBasemaps) &&
          this.renderBasemapsSelector()}
      </div>
    );
  }
}

export default Basemaps;
