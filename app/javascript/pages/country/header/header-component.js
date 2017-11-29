import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-me';

import Loader from 'components/loader/loader';

class Header extends PureComponent {
  render() {
    const {
      adminsLists,
      adminsSelected,
      handleCountryChange,
      handleRegionChange,
      handleSubRegionChange
    } = this.props;
    console.log(adminsSelected);

    // if (isRootLoading) {
    //   return <Loader parentClass="c-header" isAbsolute />;
    // }

    return (
      <div className="c-header">
        <div className="row">
          <div className="large-6 medium-12 small-12 columns container-select">
            <div className="c-header__select">
              <svg className="icon icon-angle-arrow-down c-header__select-arrow">
                <use xlinkHref="#icon-angle-arrow-down" />
              </svg>
              <Select
                value={adminsSelected.country}
                options={adminsLists.countries}
                onChange={handleCountryChange}
              />
            </div>
            <div className="c-header__select -jurisdiction">
              <svg className="icon icon-angle-arrow-down c-header__select-arrow">
                <use xlinkHref="#icon-angle-arrow-down" />
              </svg>
              <Select
                value={adminsSelected.region}
                options={adminsLists.regions}
                onChange={region =>
                  handleRegionChange(adminsSelected.country, region)
                }
              />
            </div>
            {adminsLists.subRegions ? (
              <div className="c-header__select -jurisdiction">
                <svg className="icon icon-angle-arrow-down c-header__select-arrow">
                  <use xlinkHref="#icon-angle-arrow-down" />
                </svg>
                <Select
                  value={adminsSelected.subRegion}
                  options={adminsLists.subRegions}
                  onChange={subRegion =>
                    handleSubRegionChange(
                      adminsSelected.country,
                      adminsSelected.region,
                      subRegion
                    )
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="large-6 medium-12 small-12 columns c-header__info">
            <p>
              In 2010, <strong>this</strong>
            </p>
          </div>
        </div>
        <div className="c-header__tabs">
          <div className="row">
            <ul>
              <li className="-selected">Summary</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  adminsSelected: PropTypes.object,
  adminsLists: PropTypes.object.isRequired
};

export default Header;
